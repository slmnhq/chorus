class GpdbInstance < ActiveRecord::Base
  attr_accessible :name, :description, :host, :port, :maintenance_db, :state,
                  :provision_type, :description, :instance_provider, :version

  validates_presence_of :name, :maintenance_db
  validates_numericality_of :port, :only_integer => true, :if => :host?
  validates_format_of :name, :with => /^[a-zA-Z][a-zA-Z0-9_]{0,43}$/

  has_many :activities, :as => :entity
  has_many :events, :through => :activities
  belongs_to :owner, :class_name => 'User'
  has_many :accounts, :class_name => 'InstanceAccount'
  has_many :databases, :class_name => 'GpdbDatabase'

  attr_accessor :highlighted_attributes, :search_result_notes
  searchable do
    text :name, :stored => true, :boost => SOLR_PRIMARY_FIELD_BOOST
    text :description, :stored => true, :boost => SOLR_SECONDARY_FIELD_BOOST
    string :grouping_id
    string :type_name
  end

  def self.unshared
    where("gpdb_instances.shared = false OR gpdb_instances.shared IS NULL")
  end

  def self.owned_by(user)
    if user.admin?
      scoped
    else
      where(:owner_id => user.id)
    end
  end

  def self.accessible_to(user)
    where('gpdb_instances.shared OR gpdb_instances.owner_id = :owned OR gpdb_instances.id IN (:with_membership)',
          :owned => user.id,
          :with_membership => user.instance_accounts.pluck(:gpdb_instance_id)
    )
  end

  def accessible_to(user)
    GpdbInstance.accessible_to(user).include?(self)
  end

  def refresh_databases(options ={})
    found_databases = []
    rows = Gpdb::ConnectionBuilder.connect!(self, owner_account, maintenance_db) { |conn| conn.select_all(database_and_role_sql) }
    database_account_groups = rows.inject({}) do |groups, row|
      groups[row["database_name"]] ||= []
      groups[row["database_name"]] << row["db_username"]
      groups
    end

    database_account_groups.each do |database_name, db_usernames|
      database = databases.find_or_create_by_name!(database_name)
      database.update_attributes!({:stale_at => nil}, :without_protection => true)
      database_accounts = accounts.where(:db_username => db_usernames)
      if database.instance_accounts.sort != database_accounts.sort
        database.instance_accounts = database_accounts
        QC.enqueue("GpdbDatabase.reindexDatasetPermissions", database.id)
      end
      found_databases << database
    end
  rescue ActiveRecord::JDBCError => e
    Rails.logger.error "Could not refresh database: #{e.message} on #{e.backtrace[0]}"
  ensure
    if options[:mark_stale]
      (databases.not_stale - found_databases).each do |database|
        database.stale_at = Time.now
        database.save
      end
    end
  end

  def create_database(name, current_user)
    raise ActiveRecord::StatementInvalid, "Database '#{name}' already exists." unless databases.where(:name => name).empty?
    create_database_in_instance(name, current_user)
    refresh_databases
    databases.find_by_name!(name)
  end

  def account_names
    accounts.pluck(:db_username)
  end

  def owner_account
    account_owned_by(owner)
  end

  def account_for_user(user)
    if shared?
      owner_account
    else
      account_owned_by(user)
    end
  end

  def account_for_user!(user)
    account_for_user(user) || (raise ActiveRecord::RecordNotFound.new)
  end

  def gpdb_instance
    self
  end

  private

  def create_database_in_instance(name, current_user)
    Gpdb::ConnectionBuilder.connect!(self, account_for_user!(current_user)) do |conn|
      sql = "CREATE DATABASE #{conn.quote_column_name(name)}"
      conn.exec_query(sql)
    end
  end

  def database_and_role_sql
    roles = Arel::Table.new("pg_catalog.pg_roles", :as => "r")
    databases = Arel::Table.new("pg_catalog.pg_database", :as => "d")

    roles.join(databases).
        on(Arel.sql("has_database_privilege(r.oid, d.oid, 'CONNECT')")).
        where(
        databases[:datname].not_eq("postgres").
            and(databases[:datistemplate].eq(false)).
            and(databases[:datallowconn].eq(true)).
            and(roles[:rolname].in(account_names))
    ).project(
        roles[:rolname].as("db_username"),
        databases[:datname].as("database_name")
    ).to_sql
  end

  def account_owned_by(user)
    accounts.find_by_owner_id(user.id)
  end
end

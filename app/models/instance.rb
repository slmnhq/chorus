class Instance < ActiveRecord::Base
  attr_accessible :name, :description, :host, :port, :maintenance_db,
                  :provision_type, :description, :instance_provider, :version

  validates_presence_of :name, :host, :port, :maintenance_db
  validates_numericality_of :port, :only_integer => true
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
    where("instances.shared = false OR instances.shared IS NULL")
  end

  def self.owned_by(user)
    if user.admin?
      scoped
    else
      where(:owner_id => user.id)
    end
  end

  def self.accessible_to(user)
    where('instances.shared OR instances.owner_id = :owned OR instances.id IN (:with_membership)',
          :owned => user.id,
          :with_membership => user.instance_accounts.pluck(:instance_id)
    )
  end

  def refresh_database_permissions
    rows = Gpdb::ConnectionBuilder.connect!(self, owner_account, maintenance_db) { |conn| conn.select_all(database_and_role_sql) }

    database_account_groups = rows.inject({}) do |groups, row|
      groups[row["database_name"]] ||= []
      groups[row["database_name"]] << row["db_username"]
      groups
    end

    database_account_groups.each do |database_name, db_usernames|
      database = databases.find_by_name!(database_name)
      database_accounts = accounts.where(:db_username => db_usernames)
      database.instance_accounts = database_accounts
    end
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

  def instance
    self
  end

  private

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

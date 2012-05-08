class Instance < ActiveRecord::Base
  attr_accessible :name, :description, :host, :port, :maintenance_db, :shared, :provision_type, :description, :instance_provider, :state

  validates_presence_of :name, :host, :port, :maintenance_db

  belongs_to :owner, :class_name => 'User'
  has_many :accounts, :class_name => 'InstanceAccount'

  def self.owned_by(user)
    if user.admin?
      Instance.scoped
    else
      Instance.where("owner_id = ?", user.id)
    end
  end

  def self.accessible_to(user)
    return scoped if user.admin?

    accounts_with_membership = sanitize_sql(
      [
        'LEFT OUTER JOIN instance_accounts ON instance_accounts.instance_id = instances.id AND instance_accounts.owner_id = ?',
        user.id
      ]
    )
    scoped.
      joins(accounts_with_membership).
      where('instance_accounts.id IS NOT NULL OR instances.shared = true OR instances.owner_id = ?', user.id)
  end

  def owner_account
    accounts.where(:owner_id => owner_id).first
  end

  def get_instance_provider
    return "Greenplum Database"
  end

  def account_for_user(user)
    if shared?
      owner_account
    else
      accounts.where(:owner_id => user.id).first
    end
  end
end
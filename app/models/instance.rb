class Instance < ActiveRecord::Base
  attr_accessible :name, :description, :host, :port, :maintenance_db,
                  :provision_type, :description, :instance_provider, :version, :state

  validates_presence_of :name, :host, :port, :maintenance_db

  belongs_to :owner, :class_name => 'User'
  has_many :accounts, :class_name => 'InstanceAccount'

  def self.unshared
    where("instances.shared = false OR instances.shared IS NULL")
  end

  def self.owned_by(user)
    if user.admin?
      scoped
    else
      where("owner_id = ?", user.id)
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

  def account_for_user!(user)
    if shared?
      owner_account
    else
      accounts.find_by_owner_id!(user.id)
    end
  end

  def account_for_user(user)
    account_for_user!(user)
  rescue ActiveRecord::RecordNotFound
    nil
  end

  def online?
    state == "online"
  end
end
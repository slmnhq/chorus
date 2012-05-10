class Instance < ActiveRecord::Base
  attr_accessible :name, :description, :host, :port, :maintenance_db,
                  :provision_type, :description, :instance_provider, :version

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

    where('instances.shared OR instances.owner_id = :owned OR instances.id IN (:with_membership)',
          :owned => user.id,
          :with_membership => user.instance_accounts.pluck(:instance_id)
    )
  end

  def owner_account
    accounts.find_by_owner_id!(owner_id)
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
end
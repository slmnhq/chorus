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

  attr_accessor :highlighted_attributes
  searchable do
    text :name, :stored => true
    text :description, :stored => true
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

  def owner_account
    account_owned_by!(owner)
  end

  def account_for_user!(user)
    if shared? || user.admin?
      owner_account
    else
      account_owned_by!(user)
    end
  end

  def account_for_user(user)
    account_for_user!(user)
  rescue ActiveRecord::RecordNotFound
    nil
  end

  def instance
    self
  end

  private

  def account_owned_by!(user)
    accounts.find_by_owner_id!(user.id)
  end
end

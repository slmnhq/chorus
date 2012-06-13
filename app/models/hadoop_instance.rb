class HadoopInstance < ActiveRecord::Base
  attr_accessible :name, :host, :port, :description, :username, :group_list
  belongs_to :owner, :class_name => 'User'
  has_many :activities, :as => :entity
  validates_presence_of :name, :host, :port

  after_create :create_event

  def create_event
    Event.add(owner, "INSTANCE_CREATED", self)
  end
end

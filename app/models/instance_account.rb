class InstanceAccount < ActiveRecord::Base

  attr_accessible :db_username, :db_password, :owner_id
  validates_presence_of :instance, :owner

  belongs_to :owner, :class_name => 'User'
  belongs_to :instance

  def make_connection
    ActiveRecord::Base.postgresql_connection(
        :host => instance.host,
        :port => instance.port,
        :database => instance.maintenance_db,
        :username => self.username,
        :password => self.password
    )
  end
end
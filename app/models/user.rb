class User < ActiveRecord::Base
  self.table_name = "edc_user"
  self.primary_key = "id"

  attr_accessible :user_name

  def self.create_initial_user!(name)
    raise "initial user exists" if User.first
    u = new(user_name: name)
    u.id = "InitialUser"
    u.admin = true
    u.save!
  end

  def self.named(name)
    find_by_user_name(name)
  end
end

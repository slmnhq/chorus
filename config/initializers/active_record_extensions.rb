class ActiveRecord::Base
  def self.current_user
    Thread.current[:user]
  end
end
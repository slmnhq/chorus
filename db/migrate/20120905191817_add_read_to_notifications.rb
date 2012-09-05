class AddReadToNotifications < ActiveRecord::Migration
  def change
    add_column :notifications, :read, :boolean, :null => false, :default => false
  end
end

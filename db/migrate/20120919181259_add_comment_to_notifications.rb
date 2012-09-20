class AddCommentToNotifications < ActiveRecord::Migration
  def self.up
    change_table :notifications do |t|
      t.references :comment
    end
  end
  def self.down
    remove_column :notifications, :comment_id
  end
end
class RemoveTimestampsFromActivities < ActiveRecord::Migration
  def change
    remove_column :activities, :created_at
    remove_column :activities, :updated_at
  end
end

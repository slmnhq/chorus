class AddInstanceStatusTimestampsToGpdbInstance < ActiveRecord::Migration
  def change
    add_column :gpdb_instances, :last_checked_at, :datetime
    add_column :gpdb_instances, :last_online_at, :datetime
  end
end

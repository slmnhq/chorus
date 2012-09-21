class AddInstanceStatusTimestampsToHadoopInstance < ActiveRecord::Migration
  def change
    add_column :hadoop_instances, :last_checked_at, :datetime
    add_column :hadoop_instances, :last_online_at, :datetime
  end
end

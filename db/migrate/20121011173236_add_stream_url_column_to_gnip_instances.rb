class AddStreamUrlColumnToGnipInstances < ActiveRecord::Migration
  def up
    add_column :gnip_instances, :stream_url, :string
    remove_column :gnip_instances, :host
    remove_column :gnip_instances, :port
  end
  def down
    remove_column :gnip_instances, :stream_url
    add_column :gnip_instances, :host, :string
    add_column :gnip_instances, :port, :integer
  end
end
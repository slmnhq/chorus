class CreateInstances < ActiveRecord::Migration
  def change
    create_table :instances do |t|
      t.string :name
      t.text :description
      t.string :owner
      t.string :host
      t.integer :port
      t.date :expire
      t.string :state
      t.string :provision_type
      t.string :provision_id, :length => 20
      t.integer :size
      t.string :instance_provider
      t.timestamp :last_check
      t.string :provision_name
      t.boolean :is_deleted
      t.string :instance_version
      t.string :maintenance_db
      t.string :connection_string

      t.timestamps
    end
  end
end

class CreateHadoopInstances < ActiveRecord::Migration
  def change
    create_table :hadoop_instances do |t|
      t.string :name
      t.text :description
      t.string :host
      t.integer :port
      t.integer :owner_id
      t.string :state, :default => "offline"
      t.string :version
      t.string :username
      t.string :group_list
      t.timestamps
    end
  end
end

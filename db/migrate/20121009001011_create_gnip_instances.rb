class CreateGnipInstances < ActiveRecord::Migration
  def change
    create_table :gnip_instances do |t|
      t.string :name
      t.text :description
      t.string :host
      t.integer :port
      t.integer :owner_id
      t.string :username
      t.string :password
      t.timestamps
    end
  end
end

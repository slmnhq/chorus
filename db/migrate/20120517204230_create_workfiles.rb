class CreateWorkfiles < ActiveRecord::Migration
  def change
    create_table :workfiles do |t|
      t.integer :workspace_id
      t.integer :owner_id
      t.text :description

      t.timestamps
    end
  end
end

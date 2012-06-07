class CreateEvents < ActiveRecord::Migration
  def change
    create_table :events do |t|
      t.string  :action
      t.integer :actor_id
      t.integer :object_id
      t.string  :object_type
      t.timestamps
    end
  end
end

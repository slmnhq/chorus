class CreateActivities < ActiveRecord::Migration
  def change
    create_table :activities do |t|
      t.integer :entity_id
      t.string :entity_type
      t.integer :event_id
      t.timestamps
    end
  end
end

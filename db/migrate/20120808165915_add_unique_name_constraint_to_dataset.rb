class AddUniqueNameConstraintToDataset < ActiveRecord::Migration
  def change
    add_index :datasets, [:name, :schema_id], :unique => true
  end
end

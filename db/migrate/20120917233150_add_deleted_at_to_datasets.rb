class AddDeletedAtToDatasets < ActiveRecord::Migration
  def change
    add_column :datasets, :deleted_at, :timestamp
  end
end

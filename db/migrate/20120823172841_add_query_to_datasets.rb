class AddQueryToDatasets < ActiveRecord::Migration
  def change
    add_column :datasets, :query, :text
  end
end

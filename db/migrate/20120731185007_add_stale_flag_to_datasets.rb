class AddStaleFlagToDatasets < ActiveRecord::Migration
  def change
    add_column :datasets, :stale_at, :datetime
  end
end

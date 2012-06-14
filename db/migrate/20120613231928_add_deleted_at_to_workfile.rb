class AddDeletedAtToWorkfile < ActiveRecord::Migration
  def change
     add_column :workfiles, :deleted_at, :timestamp
  end
end

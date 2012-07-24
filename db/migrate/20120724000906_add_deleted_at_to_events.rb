class AddDeletedAtToEvents < ActiveRecord::Migration
  def change
    add_column :events, :deleted_at, :timestamp
  end
end

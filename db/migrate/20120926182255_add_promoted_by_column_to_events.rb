class AddPromotedByColumnToEvents < ActiveRecord::Migration
  def change
    add_column :events, :promoted_by_id, :integer
  end
end

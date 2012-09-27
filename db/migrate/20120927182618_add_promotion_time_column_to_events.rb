class AddPromotionTimeColumnToEvents < ActiveRecord::Migration
  def change
    add_column :events, :promotion_time, :datetime
  end
end

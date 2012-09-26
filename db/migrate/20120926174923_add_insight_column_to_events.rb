class AddInsightColumnToEvents < ActiveRecord::Migration
  def change
    add_column :events, :insight, :boolean, :default => false
  end
end

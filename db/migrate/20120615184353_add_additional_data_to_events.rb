class AddAdditionalDataToEvents < ActiveRecord::Migration
  def change
    add_column :events, :additional_data, :text
  end
end

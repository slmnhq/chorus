class AddSecondTargetToEvents < ActiveRecord::Migration
  def change
    rename_column :events, :target_type, :target1_type
    rename_column :events, :target_id, :target1_id
    add_column :events, :target2_type, :string
    add_column :events, :target2_id, :integer
  end
end

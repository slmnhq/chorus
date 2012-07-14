class AddLatestWorkfileVersionIdToWorkfile < ActiveRecord::Migration
  def change
    add_column :workfiles, :latest_workfile_version_id, :integer
  end
end

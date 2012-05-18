class CreateWorkfileVersions < ActiveRecord::Migration
  def change
    create_table :workfile_versions do |t|
      t.integer :workfile_id
      t.integer :version_num
      t.integer :owner_id
      t.string :commit_message
      t.integer :modifier_id

      t.timestamps
    end
  end
end

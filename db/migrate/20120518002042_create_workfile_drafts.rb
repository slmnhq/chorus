class CreateWorkfileDrafts < ActiveRecord::Migration
  def change
    create_table :workfile_drafts do |t|
      t.integer :workfile_id
      t.integer :base_version
      t.integer :owner_id

      t.timestamps
    end
  end
end

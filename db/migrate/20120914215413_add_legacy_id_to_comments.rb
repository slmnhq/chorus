class AddLegacyIdToComments < ActiveRecord::Migration
  def change
    add_column :comments, :legacy_id, :string
  end
end

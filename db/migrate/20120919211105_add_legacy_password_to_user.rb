class AddLegacyPasswordToUser < ActiveRecord::Migration
  def change
    add_column :users, :legacy_password_digest, :string
  end
end

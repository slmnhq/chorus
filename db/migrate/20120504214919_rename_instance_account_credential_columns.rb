class RenameInstanceAccountCredentialColumns < ActiveRecord::Migration
  def change
   rename_column :instance_accounts, :username, :db_username
   rename_column :instance_accounts, :password, :db_password
  end
end

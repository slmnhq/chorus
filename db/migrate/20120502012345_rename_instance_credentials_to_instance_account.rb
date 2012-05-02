class RenameInstanceCredentialsToInstanceAccount < ActiveRecord::Migration
  def change
    rename_table :instance_credentials, :instance_accounts
  end
end

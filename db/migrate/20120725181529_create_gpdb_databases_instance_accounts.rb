class CreateGpdbDatabasesInstanceAccounts < ActiveRecord::Migration
  def change
    create_table :gpdb_databases_instance_accounts do |t|
      t.integer :gpdb_database_id, :null => false
      t.integer :instance_account_id, :null => false
    end

    add_index :gpdb_databases_instance_accounts, :gpdb_database_id
    add_index :gpdb_databases_instance_accounts, :instance_account_id
  end
end

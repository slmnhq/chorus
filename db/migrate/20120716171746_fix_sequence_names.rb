class FixSequenceNames < ActiveRecord::Migration
  def up
    execute("alter sequence instance_credentials_id_seq rename to instance_accounts_id_seq;")
    execute("alter sequence gpdb_database_objects_id_seq rename to datasets_id_seq;")
    execute("alter sequence gpdb_database_object_workspace_associations_id_seq rename to associated_datasets_id_seq;")
  end

  def down
    execute("alter sequence instance_accounts_id_seq rename to instance_credentials_id_seq;")
    execute("alter sequence datasets_id_seq rename to gpdb_database_objects_id_seq;")
    execute("alter sequence associated_datasets_id_seq rename to gpdb_database_object_workspace_associations_id_seq;")
  end
end


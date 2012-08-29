class RenameInstanceToGpdbInstance < ActiveRecord::Migration
  def up
    rename_table :instances, :gpdb_instances
    rename_index :gpdb_instances, 'index_instances_on_owner_id', 'index_gpdb_instances_on_owner_id'

    execute("alter sequence instances_id_seq rename to gpdb_instances_id_seq;")
    execute("alter index instances_pkey rename to gpdb_instances_pkey;")
  end

  def down
    rename_table :gpdb_instances, :instances
    rename_index :instances, 'index_gpdb_instances_on_owner_id', 'index_instances_on_owner_id'

    execute("alter sequence gpdb_instances_id_seq rename to instances_id_seq;")
    execute("alter index gpdb_instances_pkey rename to instances_pkey;")
  end
end

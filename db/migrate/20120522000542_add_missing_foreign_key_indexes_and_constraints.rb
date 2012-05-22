class AddMissingForeignKeyIndexesAndConstraints < ActiveRecord::Migration
  def up
    change_column :gpdb_database_objects, :schema_id, :integer, :null => false
    change_column :gpdb_databases, :instance_id, :integer, :null => false
    change_column :gpdb_schemas, :database_id, :integer, :null => false
    change_column :hadoop_instances, :owner_id, :integer, :null => false
    change_column :instance_accounts, :instance_id, :integer, :null => false
    change_column :instance_accounts, :owner_id, :integer, :null => false
    #change_column :instances, :owner_id, :integer, :null => false
    change_column :memberships, :user_id, :integer, :null => false
    change_column :memberships, :workspace_id, :integer, :null => false
    change_column :workfile_drafts, :workfile_id, :integer, :null => false
    change_column :workfile_drafts, :owner_id, :integer, :null => false
    change_column :workfile_versions, :workfile_id, :integer, :null => false
    change_column :workfile_versions, :owner_id, :integer, :null => false
    change_column :workfile_versions, :modifier_id, :integer, :null => false
    change_column :workfiles, :workspace_id, :integer, :null => false
    change_column :workfiles, :owner_id, :integer, :null => false
    change_column :workspaces, :archiver_id, :integer, :null => false
    change_column :workspaces, :owner_id, :integer, :null => false

    add_index :gpdb_database_objects, :schema_id
    add_index :gpdb_databases, :instance_id
    add_index :gpdb_schemas, :database_id
    add_index :hadoop_instances, :owner_id
    add_index :instance_accounts, :instance_id
    add_index :instance_accounts, :owner_id
    #add_index :instances, :owner_id
    #add_index :memberships, :user_id
    #add_index :memberships, :workspace_id
    add_index :workfile_drafts, :workfile_id
    add_index :workfile_drafts, :owner_id
    add_index :workfile_versions, :workfile_id
    add_index :workfile_versions, :owner_id
    add_index :workfile_versions, :modifier_id
    add_index :workfiles, :workspace_id
    add_index :workfiles, :owner_id
    add_index :workspaces, :archiver_id
    add_index :workspaces, :owner_id
  end

  def down
    change_column :gpdb_database_objects, :schema_id, :integer, :null => true
    change_column :gpdb_databases, :instance_id, :integer, :null => true
    change_column :gpdb_schemas, :database_id, :integer, :null => true
    change_column :hadoop_instances, :owner_id, :integer, :null => true
    change_column :instance_accounts, :instance_id, :integer, :null => true
    change_column :instance_accounts, :owner_id, :integer, :null => true
    #change_column :instances, :owner_id, :integer, :null => true
    change_column :memberships, :user_id, :integer, :null => true
    change_column :memberships, :workspace_id, :integer, :null => true
    change_column :workfile_drafts, :workfile_id, :integer, :null => true
    change_column :workfile_drafts, :owner_id, :integer, :null => true
    change_column :workfile_versions, :workfile_id, :integer, :null => true
    change_column :workfile_versions, :owner_id, :integer, :null => true
    change_column :workfile_versions, :modifier_id, :integer, :null => true
    change_column :workfiles, :workspace_id, :integer, :null => true
    change_column :workfiles, :owner_id, :integer, :null => true
    change_column :workspaces, :archiver_id, :integer, :null => true
    change_column :workspaces, :owner_id, :integer, :null => true

    remove_index :gpdb_database_objects, :schema_id
    remove_index :gpdb_databases, :instance_id
    remove_index :gpdb_schemas, :database_id
    remove_index :hadoop_instances, :owner_id
    remove_index :instance_accounts, :instance_id
    remove_index :instance_accounts, :owner_id
    #remove_index :instances, :owner_id
    #remove_index :memberships, :user_id
    #remove_index :memberships, :workspace_id
    remove_index :workfile_drafts, :workfile_id
    remove_index :workfile_drafts, :owner_id
    remove_index :workfile_versions, :workfile_id
    remove_index :workfile_versions, :owner_id
    remove_index :workfile_versions, :modifier_id
    remove_index :workfiles, :workspace_id
    remove_index :workfiles, :owner_id
    remove_index :workspaces, :archiver_id
    remove_index :workspaces, :owner_id
  end
end

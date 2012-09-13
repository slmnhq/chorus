class AddLegacyColumns < ActiveRecord::Migration
  def change
    add_legacy_id :events
    add_legacy_type :events
    add_legacy_id :associated_datasets
    add_legacy_id :datasets
    add_legacy_id :gpdb_instances
    add_legacy_id :hadoop_instances
    add_legacy_id :import_schedules
    add_legacy_id :instance_accounts
    add_legacy_id :memberships
    add_legacy_id :notes_workfiles
    add_legacy_id :datasets_notes
    add_legacy_id :note_attachments
    add_legacy_id :notifications
    add_legacy_id :users
    add_legacy_id :workfiles
    add_legacy_id :workfile_versions
    add_legacy_id :workfile_drafts
    add_legacy_id :workspaces

    # to resolve the same chorus view name in different workspaces
    add_column :datasets, :edc_workspace_id, :string
  end

  def add_legacy_id(tablename)
    add_column tablename, :legacy_id, :string
  end

  def add_legacy_type(tablename)
    add_column tablename, :legacy_type, :string
  end
end

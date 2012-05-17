class WorkfileMigrator
  def migrate
    unless Legacy.connection.column_exists?(:edc_work_file, :chorus_rails_workfile_id)
      Legacy.connection.add_column :edc_work_file, :chorus_rails_workfile_id, :integer
    end

    legacy_workfiles = Legacy.connection.select_all("SELECT * from edc_work_file WHERE is_deleted = 'f'")
    legacy_workfiles.each do |legacy_workfile|
      legacy_workspace = Legacy.connection.select_one("SELECT * from edc_workspace WHERE id = '#{legacy_workfile["workspace_id"]}'")
      legacy_owner = Legacy.connection.select_one("SELECT * from edc_user WHERE user_name = '#{legacy_workfile["owner"]}'")
      new_workfile = Workfile.new
      new_workfile.workspace_id = legacy_workspace["chorus_rails_workspace_id"]
      new_workfile.owner_id = legacy_owner["chorus_rails_user_id"]
      new_workfile.description = legacy_workfile["description"]
      new_workfile.created_at = legacy_workfile["created_stamp"]
      new_workfile.updated_at = legacy_workfile["last_updated_stamp"]
      new_workfile.save!

      id = legacy_workfile["id"]
      Legacy.connection.update("Update edc_work_file SET chorus_rails_workfile_id = #{new_workfile.id} WHERE id = '#{id}'")
    end

  end
end


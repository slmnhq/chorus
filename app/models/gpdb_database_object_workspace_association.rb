class GpdbDatabaseObjectWorkspaceAssociation < ActiveRecord::Base
  belongs_to :workspace
  belongs_to :gpdb_database_object

  def self.by_workspace_id(workspace_id)
    where("workspace_id=#{workspace_id}").all
  end
end

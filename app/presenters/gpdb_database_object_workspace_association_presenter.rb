class GpdbDatabaseObjectWorkspaceAssociationPresenter < Presenter
  delegate :id, :workspace, :gpdb_database_object, :to => :model

  def to_hash
    {
      :id => id,
      :gpdb_database_object => present(gpdb_database_object)
    }
  end
end

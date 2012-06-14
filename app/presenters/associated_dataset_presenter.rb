class AssociatedDatasetPresenter < Presenter
  delegate :id, :workspace, :gpdb_database_object, :to => :model

  def to_hash
    {
      :id => id,
      :workspace => present(workspace),
    }.merge(present(gpdb_database_object))
  end
end

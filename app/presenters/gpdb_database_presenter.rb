class GpdbDatabasePresenter < Presenter
  delegate :id, :name, :gpdb_instance, :to => :model

  def to_hash
    {
      :id => id,
      :name => h(name),
      :instance => present(gpdb_instance)
    }
  end
end

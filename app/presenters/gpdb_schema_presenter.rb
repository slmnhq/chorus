class GpdbSchemaPresenter < Presenter
  delegate :id, :name, :database, :database_objects, :to => :model
  def to_hash
    {
        :id => id,
        :name => h(name),
        :database => present(database),
        :dataset_count => database_objects.size
    }
  end
end

class GpdbSchemaPresenter < Presenter
  delegate :id, :name, :database, :datasets, :to => :model
  def to_hash
    {
        :id => id,
        :name => h(name),
        :database => present(database),
        :dataset_count => datasets.size
    }
  end
end

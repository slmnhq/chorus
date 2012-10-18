class GpdbSchemaPresenter < Presenter
  delegate :id, :name, :database, :datasets, :to => :model
  def to_hash
    {
        :id => id,
        :name => h(name),
        :database => present(database),
        :dataset_count => datasets.size,
        :has_credentials => model.accessible_to(current_user)
    }
  end

  def complete_json?
    true
  end
end

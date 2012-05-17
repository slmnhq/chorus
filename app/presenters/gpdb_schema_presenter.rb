class GpdbSchemaPresenter < Presenter
  def to_hash
    {
        :name => model.name,
        :instance_id => model.database.instance.id,
        :database_name => model.database.name,
        :dataset_count => model.dataset_count
    }
  end
end

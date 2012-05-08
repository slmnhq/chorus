class SchemaPresenter < Presenter
  def to_hash
    {
        :name => model.name,
        :instance_id => model.instance_id,
        :database_name => model.database_name,
        :dataset_count => model.dataset_count
    }
  end
end
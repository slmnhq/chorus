class GpdbSchemaPresenter < Presenter
  def to_hash
    {
        :id => model.id,
        :name => model.name,
        # TODO: This should be a sub-presenter
        :instance_id => model.database.instance.id,
        :instance_name => model.database.instance.name,
        # TODO: This should be a sub-presenter
        :database_id => model.database.id,
        :database_name => model.database.name,
        :dataset_count => model.database_objects.size
    }
  end
end

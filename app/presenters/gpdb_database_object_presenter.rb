class GpdbDatabaseObjectPresenter < Presenter
  def to_hash
    {
      :id => model.id,
      :name => model.name,
      :schema_id => model.schema.id,
      :schema_name => model.schema.name,
      :database_id => model.schema.database.id,
      :database_name => model.schema.database.name,
      :instance_id => model.schema.database.instance.id,
      :instance_name => model.schema.database.instance.name
    }
  end
end
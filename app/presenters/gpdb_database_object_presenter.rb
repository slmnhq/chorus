class GpdbDatabaseObjectPresenter < Presenter
  def to_hash
    {
      :id => model.id,
      :object_name => model.name,
      :type => "SOURCE_TABLE",
      # TODO: This should be a sub-presenter
      :schema_id => model.schema.id,
      :schema_name => model.schema.name,
      # TODO: This should be a sub-presenter
      :database_id => model.schema.database.id,
      :database_name => model.schema.database.name,
      # TODO: This should be a sub-presenter
      :instance => {
        :id => model.schema.database.instance.id,
        :name => model.schema.database.instance.name
      }
    }
  end
end
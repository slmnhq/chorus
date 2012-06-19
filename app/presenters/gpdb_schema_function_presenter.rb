class GpdbSchemaFunctionPresenter < Presenter
  delegate :schema_name, :function_name, :language, :return_type, :arg_names, :arg_types, :to => :model
  def to_hash
    {
        :schema_name => schema_name,
        :name => function_name,
        :language => language,
        :return_type => return_type,
        :arg_names => arg_names,
        :arg_types => arg_types
    }
  end
end
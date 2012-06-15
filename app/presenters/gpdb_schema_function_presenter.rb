class GpdbSchemaFunctionPresenter < Presenter
  delegate :function_name, :language, :return_type, :arg_names, :arg_types, :to => :model
  def to_hash
    {
        :name => function_name,
        :language => language,
        :return_type => return_type,
        :arg_names => arg_names,
        :arg_types => arg_types
    }
  end
end
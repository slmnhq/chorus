class GpdbSchemaFunctionPresenter < Presenter
  delegate :function_name, :language, :return_type, :arg_names, :arg_types, :to => :model
  def to_hash
    {
        :name => h(function_name),
        :language => language,
        :return_type => return_type,
        :arg_names => h(arg_names),
        :arg_types => arg_types
    }
  end
end
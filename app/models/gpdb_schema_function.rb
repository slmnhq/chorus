class GpdbSchemaFunction
  attr_reader :function_name, :language, :return_type, :arg_names, :arg_types

  def initialize(func_name, lang, return_type, arg_names, arg_type)
     @function_name = func_name
     @language = lang
     @return_type = return_type
     @arg_names = arg_names
     @arg_types = arg_type
  end
end
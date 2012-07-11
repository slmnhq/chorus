class GpdbSchemaFunction
  attr_reader :schema_name, :function_name, :language, :return_type, :arg_names, :arg_types, :definition, :description

  def initialize(schema_name, func_name, lang, return_type, arg_names, arg_type, definition, description)
    @schema_name = schema_name
    @function_name = func_name
    @language = lang
    @return_type = return_type
    @arg_names = convert_to_array(arg_names)
    @arg_types = convert_to_array(arg_type)
    @definition = definition
    @description = description
  end

  private

  def convert_to_array(s)
    s ? s.gsub(/[{} ]/, "").split(",") : []
  end
end
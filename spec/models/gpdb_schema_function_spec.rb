require 'spec_helper'

describe GpdbSchemaFunction do
  context "#initialize" do
    it "initializes the value" do
      schema_function = GpdbSchemaFunction.new("a_schema", "foo", "sql", "text", nil, "{text}")

      schema_function.schema_name.should == "a_schema"
      schema_function.function_name.should == "foo"
      schema_function.language.should == "sql"
      schema_function.return_type.should == "text"
      schema_function.arg_names.should == []
      schema_function.arg_types.should == ["text"]
    end

    it "makes an array out of the curly-braced string" do
      schema_function = GpdbSchemaFunction.new("a_schema", "foo", "sql", "text", "{height,width, depth}", "{int4, int5 ,int6}")

      schema_function.arg_names.should == ["height", "width", "depth"]
      schema_function.arg_types.should == ["int4", "int5", "int6"]
    end
  end
end
require "spec_helper"

describe GpdbSchemaFunctionPresenter, :type => :view do
  let(:gpdb_schema_function) { GpdbSchemaFunction.new("hello", "sql", "int4", "{int4}", "{text}") }

  subject { GpdbSchemaFunctionPresenter.new(gpdb_schema_function, view)}

  describe "#to_hash" do
    it "includes basic information" do
      hash = subject.to_hash
      hash[:name].should == "hello"
      hash[:language].should == "sql"
      hash[:return_type].should == "int4"
      hash[:arg_names].should == "{int4}"
      hash[:arg_types].should == "{text}"
    end
  end
end
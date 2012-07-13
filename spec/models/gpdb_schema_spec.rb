require 'spec_helper'

describe GpdbSchema do
  context "#refresh" do
    let(:account) { FactoryGirl.create(:instance_account) }
    let(:database) { FactoryGirl.create(:gpdb_database) }

    before(:each) do
      stub_gpdb(account, GpdbSchema::SCHEMAS_SQL => [
          {"schema_name" => "schema1"},
          {"schema_name" => "schema2"}
      ])
      stub(Dataset).refresh
    end

    describe "associations" do
      it { should belong_to(:workspace) }
    end

    it "creates new copies of the schemas in our db" do
      schemas = GpdbSchema.refresh(account, database)

      schemas.length.should == 2
      schemas.map { |schema| schema.name }.should == ["schema1", "schema2"]
    end

    it "populates new schemas with their tables and views" do
      stub(Dataset).refresh(account, anything) { |account, schema|
        FactoryGirl.create(:gpdb_table, :schema => schema)
      }

      GpdbSchema.refresh(account, database)
      GpdbSchema.find_by_name("schema1").datasets.count.should == 1
    end

    it "does not re-create schemas that already exist in our database" do
      GpdbSchema.refresh(account, database)
      GpdbSchema.refresh(account, database)

      GpdbSchema.count.should == 2
    end
  end

  describe "#functions" do
    let(:account) { FactoryGirl.create(:instance_account) }
    let(:database) { FactoryGirl.create(:gpdb_database, :name => "Analytics") }
    let(:schema) { FactoryGirl.create(:gpdb_schema, :database => database)}

    before do
      stub_gpdb(account,
        GpdbSchema::SCHEMA_FUNCTION_QUERY % schema.name=> [
            {"oid" => "1091843", "name" => "add", "lang" => "sql", "return_type" => "int4", "arg_names" => "{num1, num2}",  "arg_types" => "{int4,int4}", "prosrc" => "SELECT 'HI!'", "description" => "awesome!"},
            {"oid" => "1091844", "name" => "add", "lang" => "sql", "return_type" => "int4", "arg_names" => nil,  "arg_types" => "{text}", "prosrc" => "SELECT admin_password", "description" => "HAHA"},
        ]
      )
    end


    it "returns the GpdbSchemaFunctions" do
      functions = schema.stored_functions(account)

      functions.count.should == 2

      first_function = functions.first
      first_function.should be_a GpdbSchemaFunction
      first_function.schema_name.should == schema.name
      first_function.function_name.should == "add"
      first_function.language.should == "sql"
      first_function.return_type.should == "int4"
      first_function.arg_names.should == ["num1", "num2"]
      first_function.arg_types.should == ["int4","int4"]
      first_function.definition.should == "SELECT 'HI!'"
      first_function.description.should == "awesome!"
    end
  end

  context "associations" do
    it { should belong_to(:database) }
    it { should have_many(:datasets) }
  end
end

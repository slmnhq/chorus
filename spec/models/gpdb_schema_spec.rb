require 'spec_helper'

describe GpdbSchema do

  describe "associations" do
    it { should belong_to(:workspace) }
  end

  context "#refresh" do
    let(:instance) { instances(:bobs_instance) }
    let(:account) { instance.owner_account }
    let(:database) { gpdb_databases(:bobs_database) }
    let(:schema) { gpdb_schemas(:bobs_schema) }
    before(:each) do
      stub_gpdb(account, GpdbSchema::SCHEMAS_SQL => [
          {"schema_name" => "new_schema"},
          {"schema_name" => schema.name},
      ])
      stub(Dataset).refresh
    end

    it "creates new copies of the schemas in our db" do
      schemas = GpdbSchema.refresh(account, database)

      database.schemas.where(:name => "new_schema").should exist
    end

    it "refreshes datasets for new schemas" do
      mock(Dataset).refresh.with_any_args do |*args|
        args[0].should == account
        args[1].name.should == 'new_schema'
      end
      GpdbSchema.refresh(account, database)
    end

    it "passes the options Dataset.refresh" do
      options = {:dostuff => true}
      mock(Dataset).refresh(account, anything, options)
      GpdbSchema.refresh(account, database, options)
    end

    it "does not re-create schemas that already exist in our database" do
      GpdbSchema.refresh(account, database)
      expect {
        GpdbSchema.refresh(account, database)
      }.not_to change(GpdbSchema, :count)
    end

    it "does not refresh existing Datasets" do
      GpdbSchema.refresh(account, database)
      dont_allow(Dataset).refresh.with_any_args
      GpdbSchema.refresh(account, database)
    end

    it "refreshes all Datasets when :refresh_all is true" do
      mock(Dataset).refresh.with_any_args.twice
      GpdbSchema.refresh(account, database, :refresh_all => true)
    end

    it "marks schema as stale if it does not exist" do
      missing_schema = database.schemas.where("id <> #{schema.id}").first
      GpdbSchema.refresh(account, database, :mark_stale => true)
      missing_schema.reload.should be_stale
      missing_schema.stale_at.should be_within(5.seconds).of(Time.now)
    end

    it "does not mark schema as stale if flag is not set" do
      missing_schema = database.schemas.where("id <> #{schema.id}").first
      GpdbSchema.refresh(account, database)
      missing_schema.reload.should_not be_stale
    end

    it "does not update the stale_at time" do
      missing_schema = database.schemas.where("id <> #{schema.id}").first
      missing_schema.update_attributes({:stale_at => 1.year.ago}, :without_protection => true)
      GpdbSchema.refresh(account, database, :mark_stale => true)
      missing_schema.reload.stale_at.should be_within(5.seconds).of(1.year.ago)
    end

    it "clears stale flag on schema if it is found again" do
      schema.update_attributes({:stale_at => Time.now}, :without_protection => true)
      GpdbSchema.refresh(account, database)
      schema.reload.should_not be_stale
    end
  end

  describe "#functions" do
    let(:account) { FactoryGirl.create(:instance_account) }
    let(:database) { FactoryGirl.create(:gpdb_database, :name => "Analytics") }
    let(:schema) { FactoryGirl.create(:gpdb_schema, :database => database) }

    before do
      stub_gpdb(account,
                GpdbSchema::SCHEMA_FUNCTION_QUERY % schema.name => [
                    {"oid" => "1091843", "name" => "add", "lang" => "sql", "return_type" => "int4", "arg_names" => "{num1, num2}", "arg_types" => "{int4,int4}", "prosrc" => "SELECT 'HI!'", "description" => "awesome!"},
                    {"oid" => "1091844", "name" => "add", "lang" => "sql", "return_type" => "int4", "arg_names" => nil, "arg_types" => "{text}", "prosrc" => "SELECT admin_password", "description" => "HAHA"},
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
      first_function.arg_types.should == ["int4", "int4"]
      first_function.definition.should == "SELECT 'HI!'"
      first_function.description.should == "awesome!"
    end
  end

  context "associations" do
    it { should belong_to(:database) }
    it { should have_many(:datasets) }
  end

  describe "callbacks" do
    let(:schema) { gpdb_schemas(:bobs_schema) }

    describe "before_save" do
      describe "#mark_datasets_as_stale" do
        it "if the schema has become stale, datasets will also be marked as stale" do
          schema.update_attributes!({:stale_at => Time.now}, :without_protection => true)
          dataset = schema.datasets.first
          dataset.should be_stale
          dataset.stale_at.should be_within(5.seconds).of(Time.now)
        end
      end
    end
  end
end

require 'spec_helper'

describe GpdbSchema do
  context "#refresh" do
    let(:account) { FactoryGirl.create(:instance_account) }
    let(:database) { FactoryGirl.create(:gpdb_database) }

    before(:each) do
      stub_gpdb(account, GpdbSchema::SCHEMAS_AND_DATASET_COUNT => [
          ["schema1", "50"],
          ["schema2", "30"]
      ])
    end

    it "creates new copies of the schemas in our db" do
      schemas = GpdbSchema.refresh(account, database)

      schemas.length.should == 2
      schemas.map { |schema| schema.name }.should == ["schema1", "schema2"]
      schemas.map { |schema| schema.dataset_count }.should == [50, 30]
    end

    it "does not re-create schemas that already exist in our database" do
      GpdbSchema.refresh(account, database)
      GpdbSchema.refresh(account, database)

      GpdbSchema.count.should == 2
    end

    it "destroy schemas that no longer exist in gpdb" do
      GpdbSchema.refresh(account, database)

      stub_gpdb(account, GpdbSchema::SCHEMAS_AND_DATASET_COUNT => [
          ["schema1", "50"]
      ])

      GpdbSchema.refresh(account, database)
      schemas = GpdbSchema.all

      schemas.length.should == 1
      schemas.map { |schema| schema.name }.should == ["schema1"]
    end

    it "does not destroy schemas on other databases" do
      other_database = FactoryGirl.create(:gpdb_database)
      to_be_kept = FactoryGirl.create(:gpdb_schema, :database => other_database, :name => "matching")
      to_be_deleted = FactoryGirl.create(:gpdb_schema, :database => database, :name => "matching")

      stub_gpdb(account, GpdbSchema::SCHEMAS_AND_DATASET_COUNT => [
          ["new", "50"]
          #["matching", "50"] # deleting
      ])
      GpdbSchema.refresh(account, database)

      other_database.schemas.count.should == 1
    end
  end

  context "associations" do
    it { should belong_to(:database) }
    it { should have_many(:database_objects) }
  end
end

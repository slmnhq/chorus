require 'spec_helper'

describe GpdbSchema do
  context "#refresh" do
    let(:instance) { FactoryGirl.build(:instance, :id => 123) }
    let(:account) { FactoryGirl.build(:instance_account, :instance => instance) }
    let(:database) { FactoryGirl.create(:gpdb_database, :instance => instance) }

    before(:each) do
      stub_gpdb(account, GpdbSchema::SCHEMAS_AND_DATASET_COUNT => [
                [ "schema1", "50"],
                [ "schema2", "30"]
      ])
    end

    it "creates new copies of the schemas in our db" do
      schemas = GpdbSchema.refresh(account, database)

      schemas = GpdbSchema.refresh(account, database)

      schemas.length.should == 2
      schemas.map {|schema| schema.name }.should == ["schema1", "schema2"]
      schemas.map {|schema| schema.dataset_count }.should == [50, 30]
    end

    it "does not re-create schemas that already exist in our database" do
      GpdbSchema.refresh(account, database)
      GpdbSchema.refresh(account, database)

      GpdbSchema.count.should == 2
    end

    it "destroy schemas that no longer exist in gpdb" do
      GpdbSchema.refresh(account, database)

      stub_gpdb(account, GpdbSchema::SCHEMAS_AND_DATASET_COUNT => [
                [ "schema1", "50"]
      ])

      GpdbSchema.refresh(account, database)
      schemas = GpdbSchema.all

      schemas.length.should == 1
      schemas.map {|schema| schema.name }.should == ["schema1"]
    end

    it "does not destroy schemas on other databases" do
      other_database = FactoryGirl.create(:gpdb_database)
      stub_gpdb(account, GpdbSchema::SCHEMAS_AND_DATASET_COUNT => [
                [ "matching", "50"],
                [ "different", "30"]
      ])
      GpdbSchema.refresh(account, other_database)

      stub_gpdb(account, GpdbSchema::SCHEMAS_AND_DATASET_COUNT => [
                [ "matching", "50"]
      ])

      other_database.reload.schemas.count.should == 2
    end
  end

  context "associations" do
    it { should belong_to(:database) }
  end
end

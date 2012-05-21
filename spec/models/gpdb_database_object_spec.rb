require 'spec_helper'

describe GpdbDatabaseObject do
  describe "associations" do
    it { should belong_to(:schema) }
  end

  context "#refresh" do
    let(:account) { FactoryGirl.create(:instance_account) }
    let(:schema) { FactoryGirl.create(:gpdb_schema) }
    let(:db_objects_sql) { ActiveRecord::Base.send(:sanitize_sql, [GpdbDatabaseObject::DATABASE_OBJECTS_SQL, schema.name], nil) }

    before(:each) do
      stub_gpdb(account, db_objects_sql => [
          ["r", "table1", "Great new table"],
          ["v", "view1", "Great new view"]
      ])
    end

    it "creates new copies of the db objects in our db" do
      GpdbDatabaseObject.refresh(account, schema)

      db_objects = schema.database_objects.order(:name).all
      db_objects.length.should == 2
      db_objects.map { |obj| obj.name }.should == ["table1", "view1"]
      db_objects.map { |obj| obj.class }.should == [GpdbTable, GpdbView]
      db_objects.map { |obj| obj.comment }.should == ["Great new table", "Great new view"]
    end

    it "does not re-create db objects that already exist in our database" do
      GpdbDatabaseObject.refresh(account, schema)
      GpdbDatabaseObject.refresh(account, schema)

      GpdbDatabaseObject.count.should == 2
    end

    it "destroy db objects that no longer exist in gpdb" do
      GpdbDatabaseObject.refresh(account, schema)

      stub_gpdb(account, db_objects_sql => [
          ["r", "table1", "Great new table"]
      ])

      GpdbDatabaseObject.refresh(account, schema)
      database_objects = GpdbDatabaseObject.all

      database_objects.length.should == 1
      database_objects.map(&:name).should == ["table1"]
    end

    it "does not destroy db objects on other schemas" do
      other_schema = FactoryGirl.create(:gpdb_schema)
      to_be_kept = FactoryGirl.create(:gpdb_table, :schema => other_schema, :name => "matching")
      to_be_deleted = FactoryGirl.create(:gpdb_table, :schema => schema, :name => "matching")

      stub_gpdb(account, db_objects_sql => [
          ["r", "new", ""]
          #["r", "matching", ""] # deleting
      ])
      GpdbDatabaseObject.refresh(account, schema)

      other_schema.reload.database_objects.count.should == 1
    end
  end
end
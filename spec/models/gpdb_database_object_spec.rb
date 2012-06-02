require 'spec_helper'

describe GpdbDatabaseObject do
  let(:account) { FactoryGirl.create(:instance_account) }
  let(:schema) { FactoryGirl.create(:gpdb_schema) }
  let(:db_objects_sql) { GpdbDatabaseObject::database_objects(schema.name).to_sql }
  let(:comments_sql) { GpdbDatabaseObject.comments_for_tables(schema.name, ["view1", "table1"]).to_sql }

  describe "associations" do
    it { should belong_to(:schema) }
  end

  describe "validations" do
    it { should validate_presence_of :name }
  end

  describe ".with_name_like" do
    it "scopes objects by name" do
      FactoryGirl.create(:gpdb_table, :name => "match")
      FactoryGirl.create(:gpdb_table, :name => "nope")

      GpdbDatabaseObject.with_name_like("match").count.should == 1
    end

    it "matches anywhere in the name, regardless of case" do
      FactoryGirl.create(:gpdb_table, :name => "amatCHingtable")

      GpdbDatabaseObject.with_name_like("match").count.should == 1
      GpdbDatabaseObject.with_name_like("MATCH").count.should == 1
    end

    it "returns all objects if name is not provided" do
      FactoryGirl.create(:gpdb_table)
      GpdbDatabaseObject.with_name_like(nil).count.should == 1
    end
  end

  context ".refresh" do
    before(:each) do
      stub_gpdb(account, db_objects_sql => [
        { 'type' => "r", "name" => "table1", "master_table" => 't' },
        { 'type' => "v", "name" => "view1",  "master_table" => 'f' }
      ])
    end

    it "creates new copies of the db objects in our db" do
      GpdbDatabaseObject.refresh(account, schema)

      db_objects = schema.database_objects.order(:name)
      db_objects.size.should == 2
      db_objects.map(&:class).should == [GpdbTable, GpdbView]
      db_objects.pluck(:name).should == ["table1", "view1"]
      db_objects.pluck(:master_table).should == [true, false]
    end

    it "does not re-create db objects that already exist in our database" do
      GpdbDatabaseObject.refresh(account, schema)
      GpdbDatabaseObject.refresh(account, schema)

      GpdbDatabaseObject.count.should == 2
    end

    it "destroy db objects that no longer exist in gpdb" do
      GpdbDatabaseObject.refresh(account, schema)

      stub_gpdb(account, db_objects_sql => [
        { 'type' => "r", "name" => "table1", "comment" => "Great new table" }
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
          { 'type' => "r", 'name' => "new", 'comment' => "" }
      ])
      GpdbDatabaseObject.refresh(account, schema)

      other_schema.reload.database_objects.count.should == 1
    end
  end

  describe ".add_metadata!(db_objects, account)" do
    let(:db_objects) { schema.database_objects }

    before(:each) do
      stub_gpdb(account,
        db_objects_sql => [
          { 'type' => "r", "name" => "table1", "master_table" => 't' },
          { 'type' => "v", "name" => "view1",  "master_table" => 'f' }
        ],

        comments_sql => [
          { 'object_name' => 'view1',  'comment' => "view1 is cool" },
          { 'object_name' => 'table1', 'comment' => "table1 is cool" }
        ]
      )
    end

    it "fills in the 'comment' attribute of each db object in the relation" do
      GpdbDatabaseObject.refresh(account, schema)
      GpdbDatabaseObject.add_metadata!(db_objects, account)

      db_objects[0].comment.should == "view1 is cool"
      db_objects[1].comment.should == "table1 is cool"
    end
  end
end

require 'legacy_migration_spec_helper'

describe DatabaseObjectMigrator do

  before :all do
    DatabaseObjectMigrator.migrate
  end

  it "should normalize the keys correctly" do
    Legacy.connection.exec_query(%Q(select strip_outside_quotes('"aaa"|"bbb"')))[0]['strip_outside_quotes'].should == 'aaa"|"bbb'
    Legacy.connection.exec_query(%Q(select normalize_key('"aaa"|"bbb"')))[0]['normalize_key'].should == 'aaa|bbb'
    Legacy.connection.exec_query(%Q(select normalize_key('"aaa"|"cc"dd"|"bbb"')))[0]['normalize_key'].should == 'aaa|cc"dd|bbb'
    DatabaseObjectMigrator.normalize_key('"aaa"|"bbb"').should == 'aaa|bbb'
    DatabaseObjectMigrator.normalize_key('"aaa"|"cc"dd"|"bbb"').should == 'aaa|cc"dd|bbb'
  end

  it "should migrate datasets and schemas from edc_activity_stream_object and edc_sandbox, and be idempotent" do
    dataset_count = Dataset.count
    schema_count = GpdbSchema.count
    DatabaseObjectMigrator.migrate
    Dataset.count.should == dataset_count
    GpdbSchema.count.should == schema_count
  end

  it "should have a type for every migrated dataset" do
    d = Dataset.where("type IS NULL")
    d.should be_empty
  end
end
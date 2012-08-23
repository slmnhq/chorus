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
    Dataset.count.should == 102
    GpdbSchema.count.should == 14
    DatabaseObjectMigrator.migrate
    Dataset.count.should == 102
    GpdbSchema.count.should == 14

    database = Instance.find_by_name('gillette').databases.find_by_name('analytics_with%')
    database.schemas.find_by_name('no_datasets').should be_present
  end
end
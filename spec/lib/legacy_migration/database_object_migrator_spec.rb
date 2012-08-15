require 'spec_helper_no_transactions'

describe DatabaseObjectMigrator do
  it "should migrate datasets and schemas from edc_activity_stream_object and edc_sandbox, and be idempotent" do
    DatabaseObjectMigrator.new.migrate
    Dataset.count.should == 17
    GpdbSchema.count.should == 9
    DatabaseObjectMigrator.new.migrate
    Dataset.count.should == 17
    GpdbSchema.count.should == 9

    database = Instance.find_by_name('gillette').databases.find_by_name('analytics_with%')
    database.schemas.find_by_name('no_datasets').should be_present
  end
end
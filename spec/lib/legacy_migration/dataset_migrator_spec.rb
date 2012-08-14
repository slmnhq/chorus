require 'spec_helper_no_transactions'

describe DatasetMigrator do
  it "should migrate datasets from the activity_stream_object table, and be idempotent" do
    DatasetMigrator.new.migrate
    Dataset.count.should == 17
    DatasetMigrator.new.migrate
    Dataset.count.should == 17
  end
end
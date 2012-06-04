require 'spec_helper'

describe 'dataset statistics on real databases' do
  let(:instance) { FactoryGirl.create(:instance, :host => 'gillette', :port => '5432') }
  let(:account) { FactoryGirl.create(:instance_account, :db_username => "edcadmin", :db_password => "secret",
                                     :instance => instance) }

  before do
    GpdbDatabase.refresh(account)

    database = GpdbDatabase.find_by_name('dca_demo')
    GpdbSchema.refresh(account, database)

    gpdb_schema = GpdbSchema.find_by_name('public')
    GpdbDatabaseObject.refresh(account, gpdb_schema)
  end

  context "table that has partitions" do
    it "counts the number of partitions" do
      table = GpdbTable.find_by_name('sales')

      statistics = table.stats(account)
      statistics.partition_count.should == "366"
      statistics.table_type.should == "MASTER_TABLE"
    end
  end

  context "table created from web file" do
    it "says it is an external table" do
      table = GpdbTable.find_by_name('ext_expenses')

      statistics = table.stats(account)
      statistics.table_type.should == "EXT_TABLE"
    end
  end
end
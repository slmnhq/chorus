require 'spec_helper'

describe 'dataset statistics on real databases', :type => :database_integration do
  let(:account) { real_gpdb_account }

  before do
    refresh_chorus
  end

  context "table that has partitions" do
    it "counts the number of partitions" do
      table = GpdbTable.find_by_name('master_table1')

      statistics = table.stats(account)
      statistics.partition_count.should == "7"
      statistics.table_type.should == "MASTER_TABLE"
    end
  end

  context "table created from web file" do
    it "says it is an external table" do
      table = GpdbTable.find_by_name('external_web_table1')

      statistics = table.stats(account)
      statistics.table_type.should == "EXT_TABLE"
    end
  end
end

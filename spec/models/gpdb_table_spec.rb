require "spec_helper"

describe GpdbTable do
  describe "#stats" do
    let(:account) {FactoryGirl.create(:instance_account)}
    let(:table) { FactoryGirl.create(:gpdb_table, :name => "clv_data") }
    let(:table_stats_sql) { ActiveRecord::Base.send(:sanitize_sql, [GpdbTable::TABLE_STATS_SQL, :schema => table.schema.name, :table_name => table.name], nil) }

    before do
      stub_gpdb(account, table_stats_sql => [{'table_name' => "clv_data", "rows" => 100, "columns" => 3,
                                              "master_table" => "t", "description" => "a table",
                                              "last_analyzed" => "2012-03-22 21:35:54.148935+00",
                                              "protocol" => nil, "disk_size" => "160 kB"}] )
    end

    it "return stats for a table" do
      stats = table.stats(account)

      stats.table_name.should == "clv_data"
      stats.rows.should == 100
      stats.columns.should == 3
      stats.master_table.should == true
      stats.description.should == "a table"
      stats.last_analyzed.should == "2012-03-22 21:35:54.148935+00"
      stats.protocol.should == nil
      stats.disk_size.should == "160 kB"

    end
  end
end
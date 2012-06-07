require "spec_helper"

describe GpdbTable do
  let(:account) { FactoryGirl.create(:instance_account) }
  let(:table) { FactoryGirl.create(:gpdb_table, :name => "clv_data") }

  describe "#stats" do
    let(:table_stats_sql) { ActiveRecord::Base.send(:sanitize_sql, [GpdbTable::TABLE_STATS_SQL, :schema => table.schema.name, :table_name => table.name], nil) }

    before do
      stub_gpdb(account, table_stats_sql => [{'table_name' => "clv_data", "table_type" => "BASE_TABLE", "rows" => 100, "columns" => 3,
                                              "description" => "a table",
                                              "last_analyzed" => "2012-03-22 21:35:54.148935+00",
                                              "disk_size" => "160 kB", "partition_count" => 10}] )
    end

    it "return stats for a table" do
      stats = table.stats(account)

      stats.table_name.should == "clv_data"
      stats.table_type.should == "BASE_TABLE"
      stats.rows.should == 100
      stats.columns.should == 3
      stats.description.should == "a table"
      stats.last_analyzed.to_s.should == Time.utc(2012, 03, 22, 21, 35, 54).to_s
      stats.disk_size.should == "160 kB"
      stats.partition_count.should == 10
    end
  end

  describe "#analyze" do
    it "generates the correct sql" do
      fake_connection = Object.new
      mock(fake_connection).select_all("analyze \"#{table.schema.name}\".\"#{table.name}\"")
      stub(table.schema).with_gpdb_connection(account) { |_, block| block.call(fake_connection) }

      table.analyze(account)
    end
  end
end

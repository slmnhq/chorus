require 'spec_helper'

describe GpdbTableStatistics do
  context "#initialize" do
    it "initialize the values" do
      statistics = GpdbTableStatistics.new(
          {
           'description' => 'New Description',
           'column_count' => '4',
           'row_count' => '23',
           'table_type' => 'BASE_TABLE',
           'last_analyzed' => '2012-06-06 23:02:42.40264+00',
           'disk_size' => '230 kB',
           'partition_count' => '2'
          }
      )

      statistics.row_count.should == 23
      statistics.table_type.should == "BASE_TABLE"
      statistics.column_count.should == 4
      statistics.description.should == 'New Description'
      statistics.last_analyzed.to_s.should == "2012-06-06 23:02:42 UTC"
      statistics.disk_size.should == '230 kB'
      statistics.partition_count.should == 2
    end
  end
end

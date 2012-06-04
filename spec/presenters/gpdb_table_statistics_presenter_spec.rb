require 'spec_helper'

describe GpdbTableStatisticsPresenter, :type => :view do
  let(:statistics) { FactoryGirl.build(:gpdb_table_statistics) }

  describe "#to_hash" do
    subject { described_class.new(statistics, view) }

    it "includes the fields" do
      hash = subject.to_hash

      hash[:object_type].should == 'BASE_TABLE'
      hash[:object_name].should == 'A1000'
      hash[:rows].should == 1000
      hash[:columns].should == 5
      hash[:description].should == 'This is a nice table.'
      hash[:last_analyzed_time].should == Time.utc(2012, 10, 20, 10, 30, 00)
      hash[:on_disk_size].should == 2048
      hash[:partitions].should == 0
    end
  end
end
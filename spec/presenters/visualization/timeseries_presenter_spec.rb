require 'spec_helper'

describe Visualization::TimeseriesPresenter, :type => :view do
  before(:each) do
    @visualization_data = FactoryGirl.build(:visualization_timeseries)
    @visualization_data.rows = [
      {"time" => "2012-03", "value" => 5},
      {"time" => "2012-04", "value" => 15},
      {"time" => "2012-05", "value" => 25}
    ]

    @presenter = Visualization::TimeseriesPresenter.new(@visualization_data, view)
  end

  describe "#to_hash" do
    before do
      @hash = @presenter.to_hash
    end

    it "includes base attributes" do
      @hash[:type].should == @visualization_data.type
      @hash[:x_axis].should == @visualization_data.time
      @hash[:y_axis].should == @visualization_data.value
      @hash[:time_interval].should == @visualization_data.time_interval
      @hash[:aggregation].should == @visualization_data.aggregation
      @hash[:filters].should == @visualization_data.filters
    end

    it "includes rows" do
      @hash[:rows].should == [
        {"time" => "2012-03", "value" => 5},
        {"time" => "2012-04", "value" => 15},
        {"time" => "2012-05", "value" => 25}
      ]
    end

    it "includes columns" do
      @hash[:columns].should == [
        {:name => "time", :type_category => "DATETIME"},
        {:name => "value", :type_category => "REAL_NUMBER"}
      ]
    end
  end
end

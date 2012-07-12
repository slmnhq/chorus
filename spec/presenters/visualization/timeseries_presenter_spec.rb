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

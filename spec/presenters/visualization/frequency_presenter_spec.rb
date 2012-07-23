require 'spec_helper'

describe Visualization::FrequencyPresenter, :type => :view do
  before(:each) do
    @visualization_data = FactoryGirl.build(:visualization_frequency)
    @visualization_data.rows = [
        { "bucket" => "Tom Waits", "count"=>5 },
        { "bucket" => "Neil Young", "count"=>5 },
        { "bucket" => "The Beach Boys", "count"=>6 },
        { "bucket" => "The Kinks", "count"=>6 }
    ]

    @presenter = Visualization::FrequencyPresenter.new(@visualization_data, view)
  end

  describe "#to_hash" do
    before do
      @hash = @presenter.to_hash
    end

    it "includes base attributes" do
      @hash[:type].should == @visualization_data.type
      @hash[:bins].should == @visualization_data.bins
      @hash[:y_axis].should == @visualization_data.category
      @hash[:filters].should == @visualization_data.filters
    end

    it "includes rows" do
      @hash[:rows].should == [
          { "bucket" => "Tom Waits", "count" => 5 },
          { "bucket" => "Neil Young", "count" => 5 },
          { "bucket" => "The Beach Boys", "count" => 6 },
          { "bucket" => "The Kinks", "count" => 6 }
      ]
    end

    it "includes columns" do
      @hash[:columns].should == [
          { :name => "bucket", :type_category => "STRING" },
          { :name => "count", :type_category => "WHOLE_NUMBER" }
      ]
    end
  end
end

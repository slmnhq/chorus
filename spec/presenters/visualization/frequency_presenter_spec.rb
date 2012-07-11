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
    @visualization_data.columns = [
        { 'name' => "bucket", 'typeCategory' => "text" },
        { 'name' => "count", 'typeCategory' => "integer" }
    ]

    @presenter = Visualization::FrequencyPresenter.new(@visualization_data, view)
  end

  describe "#to_hash" do
    before do
      @hash = @presenter.to_hash
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

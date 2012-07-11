require 'spec_helper'

describe Visualization::HistogramPresenter, :type => :view do
  before(:each) do
    @visualization_data = FactoryGirl.build(:visualization_histogram)
    @visualization_data.rows = [
        { "bin" => [0,1], "frequency"=>6 },
        { "bin" => [2,3], "frequency"=>9 },
        { "bin" => [3,4], "frequency"=>6 },
        { "bin" => [4,5], "frequency"=>11 }
    ]

    @presenter = Visualization::HistogramPresenter.new(@visualization_data, view)
  end

  describe "#to_hash" do
    before do
      @hash = @presenter.to_hash
    end

    it "includes rows" do
      @hash[:rows].should == [
          {"bin" => [0, 1], "frequency" => 6},
          {"bin" => [2, 3], "frequency" => 9},
          {"bin" => [3, 4], "frequency" => 6},
          {"bin" => [4, 5], "frequency" => 11}
      ]
    end

    it "includes columns" do
      @hash[:columns].should == [
          {:name => "bin", :type_category => "STRING"},
          {:name => "frequency", :type_category => "WHOLE_NUMBER"}
      ]
    end
  end
end
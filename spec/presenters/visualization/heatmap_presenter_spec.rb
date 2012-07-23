require 'spec_helper'

describe Visualization::HeatmapPresenter, :type => :view do
  before(:each) do
    @visualization_data = FactoryGirl.build(:visualization_heatmap)
    @visualization_data.rows = [
      {'value' => '11', 'x' => '1', 'xLabel' => [1.0, 4.0], 'y' => '1', 'yLabel' => [1.0, 4.0]},
      {'value' => '', 'x' => '1', 'xLabel' => [1.0, 4.0], 'y' => '2', 'yLabel' => [4.0, 7.0]},
      {'value' => '13', 'x' => '1', 'xLabel' => [1.0, 4.0], 'y' => '3', 'yLabel' => [7.0, 10.0]},
      {'value' => '21', 'x' => '2', 'xLabel' => [4, 7], 'y' => '1', 'yLabel' => [1, 4]},
      {'value' => '22', 'x' => '2', 'xLabel' => [4, 7], 'y' => '2', 'yLabel' => [4, 7]},
      {'value' => '23', 'x' => '2', 'xLabel' => [4, 7], 'y' => '3', 'yLabel' => [7, 10]},
      {'value' => '', 'x' => '3', 'xLabel' => [7, 10], 'y' => '1', 'yLabel' => [1, 4]},
      {'value' => '', 'x' => '3', 'xLabel' => [7, 10], 'y' => '2', 'yLabel' => [4, 7]},
      {'value' => '33', 'x' => '3', 'xLabel' => [7, 10], 'y' => '3', 'yLabel' => [7, 10]}
    ]

    @presenter = Visualization::HeatmapPresenter.new(@visualization_data, view)
  end

  describe "#to_hash" do
    before do
      @hash = @presenter.to_hash
    end

    it "includes base attributes" do
      @hash[:type].should == @visualization_data.type
      @hash[:x_bins].should == @visualization_data.x_bins
      @hash[:y_bins].should == @visualization_data.y_bins
      @hash[:x_axis].should == @visualization_data.x_axis
      @hash[:y_axis].should == @visualization_data.y_axis
      @hash[:filters].should == @visualization_data.filters
    end

    it "includes rows" do
      @hash[:rows].should == [
        {'value' => '11', 'x' => '1', 'xLabel' => [1.0, 4.0], 'y' => '1', 'yLabel' => [1.0, 4.0]},
        {'value' => '', 'x' => '1', 'xLabel' => [1.0, 4.0], 'y' => '2', 'yLabel' => [4.0, 7.0]},
        {'value' => '13', 'x' => '1', 'xLabel' => [1.0, 4.0], 'y' => '3', 'yLabel' => [7.0, 10.0]},
        {'value' => '21', 'x' => '2', 'xLabel' => [4, 7], 'y' => '1', 'yLabel' => [1, 4]},
        {'value' => '22', 'x' => '2', 'xLabel' => [4, 7], 'y' => '2', 'yLabel' => [4, 7]},
        {'value' => '23', 'x' => '2', 'xLabel' => [4, 7], 'y' => '3', 'yLabel' => [7, 10]},
        {'value' => '', 'x' => '3', 'xLabel' => [7, 10], 'y' => '1', 'yLabel' => [1, 4]},
        {'value' => '', 'x' => '3', 'xLabel' => [7, 10], 'y' => '2', 'yLabel' => [4, 7]},
        {'value' => '33', 'x' => '3', 'xLabel' => [7, 10], 'y' => '3', 'yLabel' => [7, 10]}
      ]
    end

    it "includes columns" do
      @hash[:columns].should == [
        { name: 'x', typeCategory: 'WHOLE_NUMBER' },
        { name: 'y', typeCategory: 'WHOLE_NUMBER' },
        { name: 'value', typeCategory: 'REAL_NUMBER' },
        { name: 'xLabel', typeCategory: 'STRING' },
        { name: 'yLabel', typeCategory: 'STRING' }
      ]
    end
  end
end

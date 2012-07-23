require 'spec_helper'

describe Visualization::BoxplotPresenter, :type => :view do
  before(:each) do
    @visualization_data = FactoryGirl.build(:visualization_boxplot)
    @visualization_data.rows = [
        {:bucket => "apple", :min => 0.0, :median => 0.5, :max => 1.0, :first_quartile => 0.25, :third_quartile => 0.75, :percentage => "22.22%", :count => 1},
        {:bucket => "orange", :min => 2.0, :median => 3.0, :max => 4.0, :first_quartile => 2.5, :third_quartile => 3.5, :percentage => "33.33%", :count => 2},
        {:bucket => "papaya", :min => 5.0, :median => 6.5, :max => 8.0, :first_quartile => 5.5, :third_quartile => 7.5, :percentage => "44.44%", :count => 3}
    ]

    @presenter = Visualization::BoxplotPresenter.new(@visualization_data, view)
  end

  describe "#to_hash" do
    before do
      @hash = @presenter.to_hash
    end

    it "includes base attributes" do
      @hash[:type].should == @visualization_data.type
      @hash[:bins].should == @visualization_data.bins
      @hash[:x_axis].should == @visualization_data.category
      @hash[:y_axis].should == @visualization_data.values
      @hash[:filters].should == @visualization_data.filters
    end

    it "includes rows" do
      @hash[:rows].should == [
          {:bucket => "apple", :min => 0.0, :median => 0.5, :max => 1.0, :first_quartile => 0.25, :third_quartile => 0.75, :percentage => "22.22%", :count => 1},
          {:bucket => "orange", :min => 2.0, :median => 3.0, :max => 4.0, :first_quartile => 2.5, :third_quartile => 3.5, :percentage => "33.33%", :count => 2},
          {:bucket => "papaya", :min => 5.0, :median => 6.5, :max => 8.0, :first_quartile => 5.5, :third_quartile => 7.5, :percentage => "44.44%", :count => 3}
      ]
    end

    it "includes columns" do
      @hash[:columns].should == [
          {:name => "bucket", :type_category => "STRING"},
          {:name => "min",:type_category => "REAL_NUMBER"},
          {:name => "firstQuartile",:type_category => "REAL_NUMBER"},
          {:name => "median",:type_category => "REAL_NUMBER"},
          {:name => "thirdQuartile",:type_category => "REAL_NUMBER"},
          {:name => "max",:type_category => "REAL_NUMBER"},
          {:name => "percentage",:type_category => "STRING"}
      ]
    end
  end
end
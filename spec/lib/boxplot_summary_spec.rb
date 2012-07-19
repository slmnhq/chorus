require 'spec_helper'
require 'boxplot_summary'

describe BoxplotSummary do
  it "should handle a 1 row data set" do
    input = [{:category => 'apple', :min => 1, :max => 1, :ntile => 1, :count => 1}]

    BoxplotSummary.summarize(input).should =~[{:category => 'apple',
                                               :min => 1, :first_quartile => 1, :median => 1, :third_quartile => 1, :max => 1, :count => 1, :percentage => "100.00%"}]
  end

  it "should handle a 2 row data set" do
    input = [{:category => 'apple', :min => 1, :max => 1, :ntile => 1, :count => 1},
             {:category => 'apple', :min => 2, :max => 2, :ntile => 2, :count => 1}]

    BoxplotSummary.summarize(input).should =~[{:category => 'apple',
                                               :min => 1, :first_quartile => 1.25, :median => 1.5, :third_quartile => 1.75, :max => 2, :count => 2, :percentage => "100.00%"}]
  end

  it "should handle a 3 row data set" do
    input = [{:category => 'apple', :min => 1, :max => 1, :ntile => 1, :count => 1},
             {:category => 'apple', :min => 2, :max => 2, :ntile => 2, :count => 1},
             {:category => 'apple', :min => 3, :max => 3, :ntile => 3, :count => 1}]

    BoxplotSummary.summarize(input).should =~[{:category => 'apple',
                                               :min => 1, :first_quartile => 1.5, :median => 2, :third_quartile => 2.5, :max => 3, :count => 3, :percentage => "100.00%"}]
  end

  it "should handle a 4 row data set" do
    input = [{:category => 'apple', :min => 0, :max => 1, :ntile => 1, :count => 1},
             {:category => 'apple', :min => 2, :max => 3, :ntile => 2, :count => 1},
             {:category => 'apple', :min => 4, :max => 5, :ntile => 3, :count => 1},
             {:category => 'apple', :min => 6, :max => 7, :ntile => 4, :count => 1}]

    BoxplotSummary.summarize(input).should =~[{:category => 'apple',
                                               :min => 0, :first_quartile => 1.5, :median => 3.5, :third_quartile => 5.5, :max => 7, :count => 4, :percentage => "100.00%"}]
  end

  it "handles two categories" do
    input = [{:category => 'apple', :min => 1, :max => 1, :ntile => 1, :count => 1},
             {:category => 'apple', :min => 2, :max => 2, :ntile => 2, :count => 1},
             {:category => 'apple', :min => 3, :max => 3, :ntile => 3, :count => 1},
             {:category => 'banana', :min => 0, :max => 1, :ntile => 1, :count => 1},
             {:category => 'banana', :min => 2, :max => 3, :ntile => 2, :count => 1},
             {:category => 'banana', :min => 4, :max => 5, :ntile => 3, :count => 1},
             {:category => 'banana', :min => 6, :max => 7, :ntile => 4, :count => 1}]

    BoxplotSummary.summarize(input).should =~[{:category => 'apple', :min => 1, :first_quartile => 1.5, :median => 2, :third_quartile => 2.5, :max => 3, :count => 3, :percentage => "42.86%"},
                                              {:category => 'banana', :min => 0, :first_quartile => 1.5, :median => 3.5, :third_quartile => 5.5, :max => 7, :count => 4, :percentage => "57.14%"}]
  end
end
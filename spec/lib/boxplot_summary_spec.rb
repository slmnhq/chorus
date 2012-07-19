require 'spec_helper'
require 'boxplot_summary'

describe BoxplotSummary do
  it "should handle a 1 row data set" do
    input = [{:bucket => 'apple', :min => 1, :max => 1, :ntile => 1, :count => 1}]

    BoxplotSummary.summarize(input, nil).should =~[{:bucket => 'apple',
                                               :min => 1, :first_quartile => 1, :median => 1, :third_quartile => 1, :max => 1, :percentage => "100.00%"}]
  end

  it "should handle a 2 row data set" do
    input = [{:bucket => 'apple', :min => 1, :max => 1, :ntile => 1, :count => 1},
             {:bucket => 'apple', :min => 2, :max => 2, :ntile => 2, :count => 1}]

    BoxplotSummary.summarize(input, nil).should =~[{:bucket => 'apple',
                                               :min => 1, :first_quartile => 1.25, :median => 1.5, :third_quartile => 1.75, :max => 2, :percentage => "100.00%"}]
  end

  it "should handle a 3 row data set" do
    input = [{:bucket => 'apple', :min => 1, :max => 1, :ntile => 1, :count => 1},
             {:bucket => 'apple', :min => 2, :max => 2, :ntile => 2, :count => 1},
             {:bucket => 'apple', :min => 3, :max => 3, :ntile => 3, :count => 1}]

    BoxplotSummary.summarize(input, nil).should =~[{:bucket => 'apple',
                                               :min => 1, :first_quartile => 1.5, :median => 2, :third_quartile => 2.5, :max => 3, :percentage => "100.00%"}]
  end

  it "should handle a 4 row data set" do
    input = [{:bucket => 'apple', :min => 0, :max => 1, :ntile => 1, :count => 1},
             {:bucket => 'apple', :min => 2, :max => 3, :ntile => 2, :count => 1},
             {:bucket => 'apple', :min => 4, :max => 5, :ntile => 3, :count => 1},
             {:bucket => 'apple', :min => 6, :max => 7, :ntile => 4, :count => 1}]

    BoxplotSummary.summarize(input, nil).should =~[{:bucket => 'apple',
                                               :min => 0, :first_quartile => 1.5, :median => 3.5, :third_quartile => 5.5, :max => 7, :percentage => "100.00%"}]
  end

  it "handles two categories" do
    input = [{:bucket => 'apple', :min => 1, :max => 1, :ntile => 1, :count => 1},
             {:bucket => 'apple', :min => 2, :max => 2, :ntile => 2, :count => 1},
             {:bucket => 'apple', :min => 3, :max => 3, :ntile => 3, :count => 1},
             {:bucket => 'banana', :min => 0, :max => 1, :ntile => 1, :count => 1},
             {:bucket => 'banana', :min => 2, :max => 3, :ntile => 2, :count => 1},
             {:bucket => 'banana', :min => 4, :max => 5, :ntile => 3, :count => 1},
             {:bucket => 'banana', :min => 6, :max => 7, :ntile => 4, :count => 1}]

    BoxplotSummary.summarize(input, nil).should =~[{:bucket => 'apple', :min => 1, :first_quartile => 1.5, :median => 2, :third_quartile => 2.5, :max => 3, :percentage => "42.86%"},
                                              {:bucket => 'banana', :min => 0, :first_quartile => 1.5, :median => 3.5, :third_quartile => 5.5, :max => 7, :percentage => "57.14%"}]
  end

  it "should handle when bins are not set" do
    input = [{:bucket => 'apple', :min => 1, :max => 1, :ntile => 1, :count => 1},
             {:bucket => 'apple', :min => 2, :max => 2, :ntile => 2, :count => 1},
             {:bucket => 'apple', :min => 3, :max => 3, :ntile => 3, :count => 1},
             {:bucket => 'banana', :min => 0, :max => 1, :ntile => 1, :count => 1},
             {:bucket => 'banana', :min => 2, :max => 3, :ntile => 2, :count => 1},
             {:bucket => 'banana', :min => 4, :max => 5, :ntile => 3, :count => 1},
             {:bucket => 'banana', :min => 6, :max => 7, :ntile => 4, :count => 1}]

    BoxplotSummary.summarize(input, nil).should =~[{:bucket => 'apple', :min => 1, :first_quartile => 1.5, :median => 2, :third_quartile => 2.5, :max => 3, :percentage => "42.86%"},
                                              {:bucket => 'banana', :min => 0, :first_quartile => 1.5, :median => 3.5, :third_quartile => 5.5, :max => 7, :percentage => "57.14%"}]
  end

  it "should handle when bins are set" do
    input = [{:bucket => 'apple', :min => 1, :max => 1, :ntile => 1, :count => 1},
             {:bucket => 'apple', :min => 2, :max => 2, :ntile => 2, :count => 1},
             {:bucket => 'apple', :min => 3, :max => 3, :ntile => 3, :count => 1},
             {:bucket => 'banana', :min => 0, :max => 1, :ntile => 1, :count => 1},
             {:bucket => 'banana', :min => 2, :max => 3, :ntile => 2, :count => 1},
             {:bucket => 'banana', :min => 4, :max => 5, :ntile => 3, :count => 1},
             {:bucket => 'banana', :min => 6, :max => 7, :ntile => 4, :count => 1}]

    BoxplotSummary.summarize(input, 1).should =~[{:bucket => 'apple', :min => 1, :first_quartile => 1.5, :median => 2, :third_quartile => 2.5, :max => 3, :percentage => "42.86%"}]
  end
end
require 'spec_helper'

describe SqlResultsPresenter, :type => :view do
  let(:size_column) do
    { :name => "size", :data_type => "real" }
  end
  let(:cool_column) do
    { :name => "is_cool", :data_type => "boolean" }
  end
  let(:rows) do
    [
      ["11", "t" ],
      ["21", "f" ],
      ["31", "f" ]
    ]
  end

  let(:result) do
    SqlResults.new([
      size_column,
      cool_column
    ], rows)
  end

  subject { SqlResultsPresenter.new(result, view) }

  describe "#to_hash" do
    it "presents the columns" do
      hash = subject.to_hash
      hash[:columns].should == [
        GpdbColumnPresenter.new(GpdbColumn.new(size_column), view).to_hash,
        GpdbColumnPresenter.new(GpdbColumn.new(cool_column), view).to_hash
      ]
    end

    it "presents the rows" do
      hash = subject.to_hash
      hash[:rows].should == rows
    end
  end
end

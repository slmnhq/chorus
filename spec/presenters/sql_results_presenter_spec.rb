require 'spec_helper'

describe SqlResultPresenter, :type => :view do
  let(:result) do
    SqlResult.new.tap do |result|
      result.add_column("size", "real")
      result.add_column("is_cool", "boolean")
      result.add_row(["11", "t"])
      result.add_row(["21", "f"])
      result.add_row(["31", "f"])
    end
  end

  subject { SqlResultPresenter.new(result, view) }

  describe "#to_hash" do
    it "presents the columns" do
      hash = subject.to_hash
      hash[:columns].should == [
        GpdbColumnPresenter.new(GpdbColumn.new({ :name => "size", :data_type => "real" }), view).to_hash,
        GpdbColumnPresenter.new(GpdbColumn.new({ :name => "is_cool", :data_type => "boolean" }), view).to_hash
      ]
    end

    it "presents the rows" do
      hash = subject.to_hash
      hash[:rows].should == [
        ["11", "t"],
        ["21", "f"],
        ["31", "f"]
      ]
    end
  end
end

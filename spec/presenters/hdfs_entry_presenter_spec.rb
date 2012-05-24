require 'spec_helper'

describe HdfsEntryPresenter, :type => :view do
  before(:each) do
    entry = HdfsEntry.new('path' => "/data", 'modifiedAt' => "2010-10-20 10:11:12", 'size' => '10', 'directory' => 'true')
    @presenter = HdfsEntryPresenter.new(entry, view)
  end

  describe "#to_hash" do
    before do
      @hash = @presenter.to_hash
    end

    it "includes the fields" do
      @hash[:path].should == "/data"
      @hash[:modified_at].should == Time.parse("2010-10-20 10:11:12")
      @hash[:size].should == "10"
      @hash[:is_directory].should be_true
    end
  end
end


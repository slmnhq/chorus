require 'spec_helper'

describe CsvFilePresenter, :type => :view do
  let(:file) { test_file("test.csv", "text/csv") }

  before do
    csv = CsvFile.create(:contents => file)
    @presenter = CsvFilePresenter.new(csv, view)
  end

  describe "#to_hash" do
    before do
      @hash = @presenter.to_hash
    end

    it "includes the right keys" do
      @hash[:contents].should include('1,1,1')
      @hash[:file_name].should == 'test.csv'
    end
  end
end

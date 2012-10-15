require 'spec_helper'

describe CsvFilePresenter, :type => :view do
  let(:file) { test_file("test.csv", "text/csv") }
  let(:csv_file) { FactoryGirl.create(:csv_file, :contents => file) }
  let(:presenter) { CsvFilePresenter.new(csv_file, view) }

  describe "#to_hash" do
    before do
      @hash = presenter.to_hash
    end

    it "includes the right keys" do
      @hash[:contents].should include('1,1,1')
      @hash[:id].should == csv_file.id
    end
  end

  describe "with a broken file" do
    let(:file) { test_file("User.png", "image/png") }

    it "raises ActiveRecord::RecordInvalid exception" do
      expect {
        presenter.to_hash
      }.to raise_error(ActiveRecord::RecordInvalid)
      presenter.model.errors[:contents].should include [:FILE_INVALID, {}]
    end
  end
end

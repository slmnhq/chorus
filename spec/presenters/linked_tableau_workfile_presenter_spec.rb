require 'spec_helper'

describe LinkedTableauWorkfilePresenter, :type => :view do
  let(:user) { users(:owner) }
  let(:model) { workfiles(:tableau) }
  let(:presenter) { described_class.new(model, view, options) }
  let(:options) { {} }

  before(:each) do
    stub(ActiveRecord::Base).current_user { user }
  end

  describe "#to_hash" do
    it "should work" do
      hash = presenter.to_hash
      hash.should be_a(Hash)
      hash[:file_name].should == model.file_name
      hash.should have_key(:file_type)
      hash[:latest_version_id].should be_nil
      hash[:has_draft].should be_false
      hash[:version_info][:updated_at].should == model.created_at
    end

    it "should have tableau workbook specific keys" do
      hash = presenter.to_hash
      hash.should have_key(:workbook_url)
      hash.should have_key(:workbook_name)
    end
  end

  describe "#complete_json?" do
    it "should be true" do
      presenter.should be_complete_json
    end
  end
end

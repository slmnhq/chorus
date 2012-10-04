require 'spec_helper'

describe LinkedTableauWorkfilePresenter, :type => :view do
  let(:workspace) { workspaces(:public) }
  let(:owner) { users(:owner) }
  let(:model) { LinkedTableauWorkfile.new({:file_name => 'foo.twb', :workspace => workspace, :owner => owner}, :without_protection => true) }
  let(:presenter) { described_class.new(model, view, options) }
  let(:options) { {} }

  before(:each) do
    stub(ActiveRecord::Base).current_user { owner }
  end

  describe "#to_hash" do
    it "should work" do
      hash = presenter.to_hash
      hash.should be_a(Hash)
      hash[:file_name].should == "foo.twb"
      hash.should have_key(:file_type)
      hash[:latest_version_id].should be_nil
      hash[:has_draft].should be_false
    end
  end

  describe "#complete_json?" do
    it "should be true" do
      presenter.should be_complete_json
    end
  end
end

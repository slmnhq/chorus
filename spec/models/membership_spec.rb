require 'spec_helper'

describe Membership do
  describe "validations" do
    it { should validate_presence_of :user }
    it { should validate_presence_of :workspace }
  end

  describe "solr reindexing" do
    before do
      @workspace = FactoryGirl.create(:workspace)
      @user = FactoryGirl.create(:user)
    end

    it "reindexes the workspace after create" do
      mock(@workspace).solr_index
      @workspace.members << @user
    end

    it "reindexes the workspace after destroy" do
      @workspace.members << @user

      called = false
      any_instance_of(Workspace) do |workspace|
        stub(workspace).solr_index {called = true}
      end

      @workspace.memberships.last.destroy
      called.should be_true
    end
  end
end

require 'spec_helper'

describe Membership do
  describe "validations" do
    it { should validate_presence_of :user }
    it { should validate_presence_of :workspace }
  end

  describe "solr reindexing" do
    let(:workspace) {workspaces(:public_with_no_collaborators)}
    let(:user) { FactoryGirl.create :user }

    it "reindexes the workspace after create" do
      mock(workspace).solr_reindex
      workspace.members << user
    end

    it "reindexes the workspace after destroy" do
      workspace.members << user
      any_instance_of(Workspace) do |instance|
        stub(instance).solr_reindex { raise "reindex" }
      end
      expect {
        workspace.memberships.last.destroy
      }.to raise_error("reindex")
    end
  end
end

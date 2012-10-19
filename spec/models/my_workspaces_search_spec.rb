require 'spec_helper'

describe MyWorkspacesSearch do
  let(:owner) { users(:owner) }
  before do
    any_instance_of(Sunspot::Search::AbstractSearch) do |search|
      stub(search).group_response { {} }
    end
  end

  context "when unscoped" do
    let(:search) { described_class.new(owner, :query => 'bob') }

    it "searches only for Workspace, Workfiles and Datasets (and Notes)" do
      search.models
      Sunspot.session.should be_a_search_for(Workspace)
      Sunspot.session.should be_a_search_for(Workfile)
      Sunspot.session.should be_a_search_for(Dataset)
      Sunspot.session.should be_a_search_for(Events::Note)
      Sunspot.session.should_not be_a_search_for(User)
    end

    it "scopes the search to workspaces the user is a member of" do
      search.models
      Sunspot.session.should have_search_params(:with, :workspace_id, owner.workspace_ids.sort)
    end
  end
end

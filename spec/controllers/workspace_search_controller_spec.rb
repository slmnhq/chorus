require 'spec_helper'

describe WorkspaceSearchController do
  describe "#show" do
    let(:user) { users(:no_collaborators) }
    let(:workspace) { workspaces(:public) }

    before do
      log_in user
    end

    it_behaves_like "an action that requires authentication", :get, :show

    it "uses the workspace search object" do
      fake_search = Object.new
      mock(WorkspaceSearch).new(user, anything) do |user, params|
        params[:query].should == "marty"
        params[:workspace_id].should == workspace.id.to_s
        fake_search
      end
      mock_present { |model| model.should == fake_search }
      get :show, :query => 'marty', :workspace_id => workspace.id
    end
  end
end

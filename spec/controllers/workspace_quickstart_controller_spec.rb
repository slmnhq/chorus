require 'spec_helper'

describe WorkspaceQuickstartController do
  describe "#destroy" do
    let(:workspace) { workspaces(:public) }
    let(:owner) { workspace.owner }

    before do
      log_in owner
      delete :destroy, :workspace_id => workspace.id
      workspace.reload
    end

    it "should succeed" do
      response.code.should == "200"
    end

    it "should respond with valid json" do
      lambda { JSON.parse(response.body) }.should_not raise_error
    end

    it "should set has.. attributes to true" do
      workspace.has_added_member.should == true
      workspace.has_added_sandbox.should == true
      workspace.has_added_workfile.should == true
      workspace.has_changed_settings.should == true
    end
  end
end
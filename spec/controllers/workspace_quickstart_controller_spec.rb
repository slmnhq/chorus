require 'spec_helper'

describe WorkspaceQuickstartController do
  describe "#destroy" do

    let(:owner) { FactoryGirl.create(:user) }
    let(:workspace) { FactoryGirl.create(:workspace) }

    before do
      log_in owner
      delete :destroy, :workspace_id => workspace.id
    end

    it "should succeed" do
      response.code.should == "200"
    end



      it "should respond with valid json" do
        lambda { JSON.parse(response.body) }.should_not raise_error
      end

      it "should set has.. attributes to true" do
        workspace.reload.has_added_member.should == true
        workspace.reload.has_added_sandbox.should == true
        workspace.reload.has_added_workfile.should == true
        workspace.reload.has_changed_settings.should == true
      end

  end
end
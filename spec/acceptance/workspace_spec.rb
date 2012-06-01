require 'spec_helper'

resource "Workspace" do
  let!(:owner) { FactoryGirl.create :user }
  let!(:workspace) { FactoryGirl.build(:workspace, :owner => owner) }
  let(:id) { workspace.to_param }

  before do
    log_in owner
  end

  get "/workspaces/:id" do
    example_request "Show workspace details" do
      status.should == 200
    end
  end

  put "/workspaces/:id" do
    # TODO: this doesn't seem to actually put any data
    example_request "Update workspace details" do
      status.should == 200
    end
  end
end

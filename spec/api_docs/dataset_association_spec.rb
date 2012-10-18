require 'spec_helper'

resource "Workspace/Dataset association" do
  let(:user) { users(:owner) }
  let(:gpdb_table) { datasets(:source_table) }
  let(:workspace) { workspaces(:public)}
  let(:workspace_id) { workspace.id }
  let(:id) { gpdb_table.id }

  before do
    log_in user
  end

  delete "/workspaces/:workspace_id/datasets/:id" do
    example_request "Disassociate dataset from a workspace" do
      status.should == 200
    end
  end
end

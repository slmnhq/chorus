require 'spec_helper'

resource "Dataset Association" do
  let(:user) { users(:owner) }
  let!(:gpdb_table) { FactoryGirl.create :gpdb_table }
  let!(:workspace) { FactoryGirl.create :workspace }
  let!(:membership) { FactoryGirl.create :membership, :workspace => workspace, :user => user}
  let!(:association) { FactoryGirl.create(:associated_dataset, :dataset => gpdb_table, :workspace => workspace)}
  let(:workspace_id) { workspace.id }
  let(:id) { gpdb_table.id }

  before do
    log_in user
  end

  delete "/workspaces/:workspace_id/datasets/:id" do
    example_request "Delete dataset association" do
      status.should == 200
    end
  end

end

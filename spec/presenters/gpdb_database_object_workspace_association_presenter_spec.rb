require 'spec_helper'

describe GpdbDatabaseObjectWorkspaceAssociationPresenter, :type => :view do
  let(:user) { FactoryGirl.create :user }

  before do
    stub(view).current_user { user }
  end

  describe "#to_hash" do
    let(:workspace) { FactoryGirl.create(:workspace)}
    let(:gpdb_table) { FactoryGirl.create(:gpdb_table)}
    let(:association) { GpdbDatabaseObjectWorkspaceAssociation.create(:workspace_id => workspace.id, :gpdb_database_object_id => gpdb_table.id) }

    subject { described_class.new(association, view) }

    it "should have both workspace and dataset" do
      hash = subject.to_hash

      hash[:workspace][:id].should_not be_nil
      hash[:object_type].should == 'TABLE'
    end
  end
end

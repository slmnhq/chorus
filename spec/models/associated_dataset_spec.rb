require 'spec_helper'

describe AssociatedDataset do
  let(:gpdb_table) { FactoryGirl.create(:gpdb_table) }
  let(:workspace) { workspaces(:public) }

  describe "validations" do
    it {should validate_presence_of(:dataset_id)}
    it {should validate_presence_of(:workspace_id)}

    it "should have uniq workspace_id + dataset_id" do
      association = described_class.new
      association.workspace = workspace
      association.dataset = gpdb_table
      association.save!

      association = described_class.new
      association.workspace = workspace
      association.dataset = gpdb_table
      association.should_not be_valid
      association.errors[:dataset_id].should include [:taken, {:value => gpdb_table.id}]
    end
  end
end

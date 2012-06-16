require 'spec_helper'

describe AssociatedDataset do
  let(:workspace) { FactoryGirl.create(:workspace) }
  let(:gpdb_table) { FactoryGirl.create(:gpdb_table) }

  describe "validations" do
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

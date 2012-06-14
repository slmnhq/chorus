require 'spec_helper'

describe GpdbDatabaseObjectWorkspaceAssociation do
  let(:workspace) { FactoryGirl.create(:workspace) }
  let(:gpdb_table) { FactoryGirl.create(:gpdb_table) }

  describe "validations" do
    it "should have uniq workspace_id + gpdb_database_object_id" do
      association = GpdbDatabaseObjectWorkspaceAssociation.new
      association.workspace = workspace
      association.gpdb_database_object = gpdb_table
      association.save!

      expect {
        association = GpdbDatabaseObjectWorkspaceAssociation.new
        association.workspace = workspace
        association.gpdb_database_object = gpdb_table
        association.save!
      }.to raise_error(ActiveRecord::RecordInvalid, "Validation failed: Gpdb database object [:taken, {:value=>#{gpdb_table.id}}]")
    end
  end
end

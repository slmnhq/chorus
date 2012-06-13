require 'spec_helper'

describe GpdbDatabaseObjectWorkspaceAssociation do
  describe "validations" do
    it "should have uniq workspace_id + gpdb_database_object_id" do
      association = GpdbDatabaseObjectWorkspaceAssociation.new
      association.workspace_id = 1
      association.gpdb_database_object_id = 1
      association.save!

      expect {
        association = GpdbDatabaseObjectWorkspaceAssociation.new
        association.workspace_id = 1
        association.gpdb_database_object_id = 1
        association.save!
      }.to raise_error(ActiveRecord::RecordNotUnique)
    end
  end
end

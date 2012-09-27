require "spec_helper"

describe ModelMap do
  describe "#model_from_params(entity_type, entity_id)" do

    it "works for users" do
      model = users(:owner)
      ModelMap.model_from_params("user", model.id).should == model
    end

    it "works for workspaces" do
      model = workspaces(:public)
      ModelMap.model_from_params("workspace", model.id).should == model
    end

    it "works for workfiles" do
      model = workfiles(:public)
      ModelMap.model_from_params("workfile", model.id).should == model
    end

    it "works for greenplum instances" do
      model = gpdb_instances(:default)
      ModelMap.model_from_params("greenplum_instance", model.id).should == model
    end

    it "works for datasets" do
      model = datasets(:table)
      ModelMap.model_from_params("dataset", model.id).should == model
    end

    it "works for hdfs_file" do
      model = hdfs_entries(:hdfs_file)
      ModelMap.model_from_params("hdfs_file", model.id).should == model
    end

    it "throws an error if the entity type is not known" do
      expect {
        ModelMap.model_from_params("pirate", 13)
      }.to raise_error(ModelMap::UnknownEntityType)
    end

  end
end

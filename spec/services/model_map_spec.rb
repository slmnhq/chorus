require "spec_helper"

describe ModelMap do
  describe "#model_from_params(entity_type, entity_id)" do

    it "works for users" do
      model = users(:bob)
      ModelMap.model_from_params("user", model.id).should == model
    end

    it "works for workspaces" do
      model = workspaces(:bob_public)
      ModelMap.model_from_params("workspace", model.id).should == model
    end

    it "works for workfiles" do
      model = workfiles(:bob_public)
      ModelMap.model_from_params("workfile", model.id).should == model
    end

    it "works for greenplum instances" do
      model = instances(:greenplum)
      ModelMap.model_from_params("greenplum_instance", model.id).should == model
    end

    it "works for datasets" do
      model = datasets(:bobs_table)
      ModelMap.model_from_params("dataset", model.id).should == model
    end

    it "works for HdfsFileReference" do
      model = ModelMap.model_from_params("hdfs_file", "1234|/data/test.csv")
      model.hadoop_instance_id.should == 1234
      model.path.should == "/data/test.csv"
    end

    it "throws an error if the entity type is not known" do
      expect {
        ModelMap.model_from_params("pirate", 13)
      }.to raise_error(ModelMap::UnknownEntityType)
    end

  end
end

require 'spec_helper'

describe HdfsFileReference do

  describe ".from_param(param)" do
    it "uses the hadoop instance id and file-system path specified in the string" do
      instance_id = hadoop_instances(:hadoop).id
      path = "/foo/bar"
      param = "#{instance_id}|#{path}"
      hdfs_file = HdfsFileReference.from_param(param)

      hdfs_file.hadoop_instance_id.should == instance_id
      hdfs_file.path.should == path
    end
  end

end

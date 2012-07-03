class HdfsFileReference < ActiveRecord::Base
  attr_accessible :path, :hadoop_instance_id
end
class HdfsFileReference < ActiveRecord::Base
  attr_accessible :path, :hadoop_instance_id

  has_many :activities, :as => :entity
  has_many :events, :through => :activities
end
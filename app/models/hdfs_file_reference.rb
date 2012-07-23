class HdfsFileReference < ActiveRecord::Base
  attr_accessible :path, :hadoop_instance_id

  has_many :activities, :as => :entity
  has_many :events, :through => :activities

  def self.from_param(param)
    hadoop_instance_id, path = param.split('|')
    HdfsFileReference.find_or_create_by_hadoop_instance_id_and_path(hadoop_instance_id, path)
  end
end

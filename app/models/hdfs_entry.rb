class HdfsEntry < ActiveRecord::Base
  attr_accessor :modified_at, :size, :is_directory, :content_count

  belongs_to :hadoop_instance

  validates_uniqueness_of :path, :scope => :hadoop_instance_id

  def self.list(path, hadoop_instance)
    hdfs_query = Hdfs::QueryService.new(hadoop_instance.host, hadoop_instance.port, hadoop_instance.username, hadoop_instance.version)
    hdfs_query.list(path).map do |result|
      result[:modified_at] = Time.parse(result['modified_at'])
      result[:is_directory] = result["is_directory"].to_s == 'true'
      hdfs_entry = hadoop_instance.hdfs_entries.find_or_create_by_path(result["path"])
      hdfs_entry.assign_attributes(result, :without_protection => true)
      hdfs_entry
    end
  end

  def file
    unless is_directory
      HdfsFile.new(path, hadoop_instance, {
          :modified_at => modified_at
      })
    end
  end
end

class HdfsEntry
  attr_accessor :path, :modified_at, :size, :is_directory, :content_count, :hadoop_instance

  def self.list(path, hadoop_instance)
    hdfs_query = Hdfs::QueryService.new(hadoop_instance.host, hadoop_instance.port, hadoop_instance.username, hadoop_instance.version)
    hdfs_query.list(path).map {|result| new(result, hadoop_instance) }
  end

  def initialize(response_item, hadoop_instance)
    @hadoop_instance = hadoop_instance
    @path = response_item["path"]
    @modified_at = Time.parse(response_item["modified_at"])
    @size = response_item["size"]
    @is_directory = response_item["is_directory"].to_s == "true"
    @content_count = response_item["content_count"]
  end

  def file
    unless @is_directory
      HdfsFile.new(@path, @hadoop_instance, {
          :modified_at => @modified_at
      })
    end
  end
end
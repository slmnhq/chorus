class HdfsEntry
  attr_accessor :path, :modified_at, :size, :is_directory, :content_count

  def self.list(path, hadoop_instance)
    hdfs_query = Hdfs::QueryService.new(hadoop_instance)
    hdfs_query.list(path).map {|result| new(result) }
  end

  def initialize(response_item)
    @path = response_item["path"]
    @modified_at = Time.parse(response_item["modifiedAt"])
    @size = response_item["size"]
    @is_directory = response_item["directory"]
    @content_count = response_item["contentCount"]
  end
end
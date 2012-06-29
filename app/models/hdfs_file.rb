class HdfsFile
  attr_reader :hadoop_instance, :path

  def initialize(path, hadoop_instance, attributes={})
    @attributes = attributes
    @hadoop_instance = hadoop_instance
    @path = path
  end

  def contents
    hdfs_query = Hdfs::QueryService.new(hadoop_instance.host, hadoop_instance.port, hadoop_instance.username, hadoop_instance.version)
    hdfs_query.show(path)
  end

  def modified_at
    @attributes[:modified_at]
  end

  def url
    hadoop_instance.url.chomp('/') + '/' + path
  end
end
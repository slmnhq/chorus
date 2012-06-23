class HdfsFile
  attr_reader :hadoop_instance, :path

  def initialize(path, hadoop_instance)
    @hadoop_instance = hadoop_instance
    @path = path
  end

  def contents
    hdfs_query = Hdfs::QueryService.new(hadoop_instance)
    hdfs_query.show(@path)
  end

  def modified_at
    hdfs_entry.modified_at
  end

  private
  def hdfs_entry
    @hdfs_entry ||= HdfsEntry.list(@path, @hadoop_instance)[0]
  end
end
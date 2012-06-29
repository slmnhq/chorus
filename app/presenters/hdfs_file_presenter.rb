class HdfsFilePresenter < Presenter

  delegate :contents, :hadoop_instance, :path, :modified_at, :to => :model

  def to_hash
    {
        :contents => contents,
        :hadoop_instance => present(hadoop_instance),
        :last_updated_stamp => modified_at.strftime("%Y-%m-%d %H:%M:%S"),
        :path => path
    }
  end
end
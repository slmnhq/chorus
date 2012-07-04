class HdfsFileReferencePresenter < Presenter
  def to_hash
    {
        :hadoop_instance_id => model.hadoop_instance_id,
        :path => model.path
    }
  end
end
class HdfsEntryPresenter < Presenter
  delegate :parent_path, :modified_at, :size, :is_directory, :content_count, :name, :to => :model
  def to_hash
    {
        :path => parent_path,
        :size => size,
        :name => name,
        :count => content_count,
        :is_dir => is_directory,
        :is_binary => false,
        :last_updated_stamp => modified_at.strftime("%Y-%m-%dT%H:%M:%SZ"),
        :hadoop_instance => { :id => model.hadoop_instance.id, :name => model.hadoop_instance.name }
    }
  end
end

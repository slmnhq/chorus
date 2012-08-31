class HdfsEntryPresenter < Presenter
  delegate :id, :parent_path, :modified_at, :size, :is_directory, :content_count, :name, :ancestors, :entries, :to => :model

  def to_hash
    hash = {
        :id => id,
        :path => parent_path,
        :size => size,
        :name => name,
        :count => content_count,
        :is_dir => is_directory,
        :is_binary => false,
        :last_updated_stamp => modified_at.nil? ? "" : modified_at.strftime("%Y-%m-%dT%H:%M:%SZ"),
        :hadoop_instance => {:id => model.hadoop_instance.id, :name => model.hadoop_instance.name},
        :ancestors => ancestors,
    }
    unless options[:shallow]
      hash[:entries] = present entries, :shallow => true
    end
    hash
  end
end

class HdfsEntryPresenter < Presenter
  delegate :id, :path, :parent_path, :modified_at, :size, :is_directory, :content_count, :name, :ancestors, :entries, :contents, :hadoop_instance, :to => :model

  def to_hash
    hash = {
        :id => id,
        :size => size,
        :name => name,
        :is_dir => is_directory,
        :is_binary => false,
        :last_updated_stamp => modified_at.nil? ? "" : modified_at.strftime("%Y-%m-%dT%H:%M:%SZ"),
        :hadoop_instance => present(hadoop_instance),
        :ancestors => ancestors,
    }

    if is_directory
      hash[:entries] = present entries if options[:deep]
      hash[:count] = content_count
      hash[:path]  = parent_path
    else
      hash[:contents] = contents if options[:deep]
      hash[:path] = path
    end

    hash
  end

  def complete_json?
    options[:deep]
  end
end

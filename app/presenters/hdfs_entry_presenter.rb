class HdfsEntryPresenter < Presenter
  delegate :path, :modified_at, :size, :is_directory, :content_count, :to => :model
  def to_hash
    {
        :path => path,
        :size => size,
        :name => path.split('/').last,
        :count => content_count,
        :is_dir => is_directory,
        :is_binary => false,
        :last_updated_stamp => modified_at.strftime("%Y-%m-%d %H:%M:%S")
    }
  end
end

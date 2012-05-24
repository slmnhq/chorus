class HdfsEntryPresenter < Presenter
  def to_hash
    {
        :path => model.path,
        :modified_at => model.modified_at,
        :size => model.size,
        :is_directory => model.is_directory
    }
  end
end

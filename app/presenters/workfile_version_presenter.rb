class WorkfileVersionPresenter < Presenter
  delegate :id, :workfile, :version_num, :commit_message, :owner, :modifier, :contents, :created_at, :updated_at, to: :model

  def to_hash
    {
        :id => id,
        :version_num => version_num,
        :commit_message => h(commit_message),
        :owner => present(owner),
        :modifier => present(modifier),
        :created_at => created_at,
        :updated_at => updated_at,
        :content_url => contents.url,
        :icon_url => icon_url,
        :content => file_content
    }
  end

  def icon_url
    contents.url(:icon) if model.image?
  end

  def file_content
    File.read(contents.path) if model.text?
  end
end

class WorkfileVersionPresenter < Presenter
  delegate :id, :version_num, :commit_message, :owner, :modifier, :contents, :created_at, :updated_at, :get_content,
           :workfile, to: :model

  def to_hash
    present(workfile, :include_execution_schema => true ).merge({
      :version_info => {
        :id => id,
        :version_num => version_num,
        :commit_message => h(commit_message),
        :owner => present(owner),
        :modifier => present(modifier),
        :created_at => created_at,
        :updated_at => updated_at,
        :content_url => contents.url,
        :icon_url => icon_url,
        :content => get_content
      }
    })
  end

  def icon_url
    contents.url(:icon) if model.image?
  end
end

class WorkfileVersionPresenter < Presenter
  delegate :id, :workfile, :version_num, :commit_message, :owner, :modifier, :contents, :created_at, :updated_at, to: :model

  def to_hash
    {
        :id => id,
        :version_num => version_num,
        :commit_message => h(commit_message),
        :owner => present(owner),
        :modifier => present(modifier),
        :contents => present(contents),
        :created_at => created_at,
        :updated_at => updated_at
    }
  end
end

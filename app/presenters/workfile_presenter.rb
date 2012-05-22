class WorkfilePresenter < Presenter
  delegate :id, :workspace, :owner, :description, :versions, :file_name, :latestVersionNum, to: :model

  def to_hash
    {
        :id => id,
        :workspace => present(workspace),
        :owner => present(owner),
        :file_name => h(versions.last.contents.original_filename),
        :version_info => present(versions.last),
        :latest_version_num => versions.last.version_num
    }
  end
end

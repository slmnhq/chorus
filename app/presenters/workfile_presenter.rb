class WorkfilePresenter < Presenter
  delegate :id, :workspace, :owner, :versions, :file_name, to: :model

  def to_hash
    {
        :id => id,
        :workspace => present(workspace),
        :owner => present(owner),
        :version_info => present(last_version),
        :file_name => h(file_name),

        # TODO: Should these go in version_info?
        :file_type => h(last_version.file_type),
        :latest_version_num => last_version.version_num
    }
  end

  def last_version_file
    last_version.contents
  end

  def last_version
    @last_version ||= versions.order("version_num").last
  end
end

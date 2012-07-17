class WorkfilePresenter < Presenter
  delegate :id, :workspace, :owner, :content_type, :file_name, :latest_workfile_version, :has_draft, to: :model

  def to_hash
    {
      :id => id,
      :workspace => present(workspace),
      :owner => present(owner),
      :file_name => h(file_name),

      # TODO: Should these go in version_info?
      :file_type => h(content_type),
      :latest_version_id => latest_workfile_version.id,
      :has_draft => has_draft(@view_context.current_user)
    }
  end
end

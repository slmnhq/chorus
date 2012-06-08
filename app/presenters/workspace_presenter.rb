class WorkspacePresenter < Presenter
  delegate :id, :name, :summary, :owner, :archiver, :archived_at, :public, :image, :permissions_for, :has_added_member, :has_added_workfile, :has_added_sandbox, :has_changed_settings, to: :model

  def to_hash
    {
        :id => id,
        :name => h(name),
        :summary => sanitize(summary),
        :owner => present(owner),
        :archiver => present(archiver),
        :archived_at => archived_at,
        :public => public,
        :image => present(image),
        :permission => permissions_for(@view_context.current_user),
        :has_added_member => has_added_member,
        :has_added_workfile => has_added_workfile,
        :has_added_sandbox => has_added_sandbox,
        :has_changed_settings => has_changed_settings
    }
  end
end

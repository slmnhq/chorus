class WorkspacePresenter < Presenter
  delegate :id, :name, :summary, :owner, :archiver, :archived_at, :public, :image, :sandbox, :permissions_for, :has_added_member, :has_added_workfile, :has_added_sandbox, :has_changed_settings, to: :model

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
        :has_changed_settings => has_changed_settings,
        :sandbox_info => sandbox_hash,
        :latest_comment_list => nil   # temporarily added for rspec fixture - needed by JS specs
    }
  end

  def sandbox_hash
    rendering_activities? ? {:id => model.sandbox_id } : present(sandbox)
  end
end

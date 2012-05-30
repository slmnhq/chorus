class WorkspacePresenter < Presenter
  delegate :id, :name, :summary, :owner, :archiver, :archived_at, :public, :image, :permissions_for, to: :model

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
        :permission => permissions_for(@view_context.current_user)
    }
  end
end

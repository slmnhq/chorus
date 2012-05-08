class WorkspacePresenter < Presenter
  delegate :name, :summary, :owner, :archiver, :archived_at, to: :model

  def to_hash
    {
        :name => h(name),
        :summary => h(summary),
        :owner => present(owner),
        :archiver => present(archiver),
        :archived_at => archived_at
    }
  end
end

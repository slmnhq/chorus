class WorkspacePresenter < Presenter
  delegate :id, :name, :summary, :owner, :archiver, :archived_at, :public, :image, to: :model

  def to_hash
    {
        :id => id,
        :name => h(name),
        :summary => h(summary),
        :owner => present(owner),
        :archiver => present(archiver),
        :archived_at => archived_at.try(:strftime, "%Y-%m-%d %H:%M:%S"),
        :public => public,
        :image => present(image)
    }
  end
end

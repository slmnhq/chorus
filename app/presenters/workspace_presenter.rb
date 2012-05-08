class WorkspacePresenter < Presenter
  delegate :name, to: :model

  def to_hash
    {
        :name => name
    }
  end
end

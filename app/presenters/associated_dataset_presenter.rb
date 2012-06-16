class AssociatedDatasetPresenter < Presenter
  delegate :id, :workspace, :dataset, :to => :model

  def to_hash
    {
      :workspace => present(workspace)
    }.merge(present(dataset))
  end
end

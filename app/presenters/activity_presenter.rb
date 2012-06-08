class ActivityPresenter < Presenter
  def to_hash
    {
      :actor => present(model.actor),
      :action => model.action,
      :target => present(model.target)
    }
  end
end

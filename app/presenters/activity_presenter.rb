class ActivityPresenter < Presenter
  def to_hash
    {
      :actor => present(model.actor),
      :action => model.action,
      :object => present(model.object)
    }
  end
end

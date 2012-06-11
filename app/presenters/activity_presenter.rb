class ActivityPresenter < Presenter
  def to_hash
    {
      :actor => present(model.actor),
      :action => model.action,
      :target => present(model.target),
      :target_type => model.target.class.name
    }
  end
end

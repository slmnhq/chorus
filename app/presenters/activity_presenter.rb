class ActivityPresenter < Presenter
  def to_hash
    {
      :id => model.id,
      :actor => present(model.actor),
      :action => model.action,
      :target => present(model.target),
      :target_type => model.target.class.name,
      :timestamp => model.created_at
    }
  end
end

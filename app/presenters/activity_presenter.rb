class ActivityPresenter < Presenter
  def to_hash
    {
      :id => model.id,
      :actor => present(event.actor),
      :action => event.action,
      :target => present(event.target1),
      :target_type => event.target1.class.name,
      :timestamp => model.created_at
    }
  end

  def event
    model.event
  end
end

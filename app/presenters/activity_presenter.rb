class ActivityPresenter < Presenter
  def to_hash
    {
      :id => model.id,
      :actor => present(event.actor),
      :action => event.action,
      :timestamp => model.created_at
    }.merge(targets_hash)
  end

  private

  def targets_hash
    hash = {}
    event.targets.each do |name, object|
      hash[name] = present(object)
    end
    hash
  end

  def event
    model.event
  end
end

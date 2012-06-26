class ActivityPresenter < Presenter
  def to_hash
    basic_hash.
      merge(targets_hash).
      merge(additional_data_hash)
  end

  private

  def basic_hash
    {
      :id => model.id,
      :actor => present(event.actor),
      :action => event.action,
      :timestamp => model.created_at
    }
  end

  def additional_data_hash
    event.additional_data
  end

  def targets_hash
    event.targets.reduce({}) do |hash, entry|
      name, model = entry
      hash[name] = present(model)
      hash
    end
  end

  def event
    model.event
  end
end

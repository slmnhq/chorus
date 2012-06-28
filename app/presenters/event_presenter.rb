class EventPresenter < Presenter
  def to_hash
    basic_hash.
      merge(targets_hash).
      merge(additional_data_hash)
  end

  private

  def basic_hash
    {
      :id => model.id,
      :actor => present(model.actor),
      :action => model.action,
      :timestamp => model.created_at
    }
  end

  def additional_data_hash
    model.additional_data
  end

  def targets_hash
    model.targets.reduce({}) do |hash, entry|
      name, model = entry
      hash[name] = present(model)
      hash
    end
  end
end

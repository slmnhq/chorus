class ActivityPresenter < Presenter
  def to_hash
    basic_hash.
      merge(targets_hash).
      merge(additional_data_hash).
      merge(workspace_hash)
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

  def workspace_hash
    if event.workspace
      { :workspace => present(event.workspace) }
    else
      {}
    end
  end

  def additional_data_hash
    event.additional_data
  end

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

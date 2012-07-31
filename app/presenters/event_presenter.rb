class EventPresenter < Presenter
  def to_hash
    basic_hash.
      merge(targets_hash).
      merge(additional_data_hash).
      merge(note_action_type_hash).
      merge(note_attachment_hash)
  end

  private

  def basic_hash
    {
      :id => model.id,
      :actor => present(model.actor),
      :action => action,
      :timestamp => model.created_at
    }
  end

  def action
    return "NOTE" if model.is_a?(Events::Note)

    model.action
  end

  def note_action_type_hash
    return { :action_type => model.action } if model.is_a?(Events::Note)
    {}
  end

  def additional_data_hash
    pairs = model.additional_data.map do |key, value|
      [key, sanitize(value)]
    end

    Hash[pairs]
  end

  def targets_hash
    model.targets.reduce({}) do |hash, entry|
      name, model = entry
      hash[name] = present(model)
      hash
    end
  end

  def note_attachment_hash
    hash = []
    if model.is_a?(Events::Note)
      attachments = model.attachments
      attachments.each_with_index do |model, index|
        hash[index] = present(model)
      end
    end
    return {:attachments => hash}
  end
end

class EventPresenter < Presenter
  def to_hash
    basic_hash.
      merge(targets_hash).
      merge(additional_data_hash).
      merge(note_action_type_hash).
      merge(attachment_hash).
      merge(notification_hash).
      merge(comments_hash).
      merge(insight_hash)
  end

  def simple_hash
    basic_hash.merge(targets_hash).
        merge(additional_data_hash).
        merge(note_action_type_hash).
        merge(attachment_hash)
  end

  def complete_json?
    true
  end

  private

  def comments_hash
    {
      :comments => present(model.comments)
    }
  end

  def insight_hash
    {
        :is_insight =>  model.insight?,
        :promoted_by => model.insight? ? present(model.promoted_by) : nil,
        :promotion_time => model.insight? ? model.promotion_time : nil
    }
  end

  def notification_hash
    return { :unread => !model.notification_for_current_user.try(:read) } if @options[:read_receipts]
    {}
  end

  def basic_hash
    {
      :id => model.id,
      :actor => present(model.actor, @options),
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
      value = value.is_a?(String) ? sanitize(value) : value
      [key, value]
    end
    Hash[pairs]
  end

  def targets_hash
    model.targets.reduce({}) do |hash, entry|
      name, model = entry
      hash[name] = present(model, @options)
      hash
    end
  end

  def attachment_hash
    hash = []
    if model.is_a?(Events::Note)
      attachments = model.attachments
      attachments.each_with_index do |model, index|
        hash[index] = present(model, @options)
      end
      datasets = model.datasets
      datasets.each do |dataset|
        model_hash = present(dataset, {:workspace => model.workspace}.merge(@options))
        model_hash.merge!({:workspace => model.workspace}) if model.workspace
        model_hash.merge!({:entity_type => 'dataset'} )
        hash << model_hash
        end
      workfiles = model.workfiles
      workfiles.each do |workfile|
        model_hash = present(workfile.latest_workfile_version, @options)
        model_hash.merge!({:entity_type => 'workfile'} )
        hash << model_hash
      end
    end
    return {:attachments => hash}
  end
end

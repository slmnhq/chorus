class ChorusViewPresenter < DatasetPresenter
  delegate :id, :name, :schema, :query, :to => :model

  def to_hash
    options[:workspace] = model.workspace
    super.merge({
        :object_type => "CHORUS_VIEW",
        :query => query,
        :is_deleted => !model.deleted_at.nil?
    })
  end

  def thetype
    "CHORUS_VIEW"
  end
end

class ChorusViewPresenter < DatasetPresenter
  delegate :id, :name, :schema, :query, :to => :model

  def to_hash
    super.merge({:object_type => "CHORUS_VIEW"})
  end

  def thetype
    "CHORUS_VIEW"
  end
end

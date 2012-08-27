class ChorusViewPresenter < DatasetPresenter
  delegate :id, :name, :schema, :query, :to => :model

  def thetype
    "CHORUS_VIEW"
  end
end

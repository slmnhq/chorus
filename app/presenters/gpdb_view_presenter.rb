class GpdbViewPresenter < GpdbDatabaseObjectPresenter
  delegate :definition, :to => :model

  def to_hash
    super.merge(
      :object_type => "VIEW",
      :definition => definition
    )
  end
end

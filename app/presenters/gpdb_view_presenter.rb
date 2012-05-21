class GpdbViewPresenter < GpdbDatabaseObjectPresenter
  def to_hash
    super.merge(:object_type => "VIEW")
  end
end
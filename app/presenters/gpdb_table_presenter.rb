class GpdbTablePresenter < GpdbDatabaseObjectPresenter
  def to_hash
    super.merge(:object_type => "TABLE")
  end
end
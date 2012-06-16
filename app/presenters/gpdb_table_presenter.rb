class GpdbTablePresenter < DatasetPresenter
  def to_hash
    super.merge(:object_type => "TABLE")
  end
end
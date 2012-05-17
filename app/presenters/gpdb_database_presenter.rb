class GpdbDatabasePresenter < Presenter
  def to_hash
    {
        :id => model.id,
        :name => model.name,
        :instance_id => model.instance_id
    }
  end
end

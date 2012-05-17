class GpdbDatabasePresenter < Presenter
  def to_hash
    {
        :id => model.id,
        :name => model.name,
        # TODO: This should be a sub-presenter for the instance
        :instance_id => model.instance.id,
        :instance_name => model.instance.name
    }
  end
end

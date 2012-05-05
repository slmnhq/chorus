class DatabasePresenter < Presenter
  def to_hash
    {
        :name => model.name,
        :instance_id => model.instance_id
    }
  end
end
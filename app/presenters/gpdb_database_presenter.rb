class GpdbDatabasePresenter < Presenter
  delegate :id, :name, :instance, :to => :model

  def to_hash
    {
      :id => id,
      :name => h(name),
      :instance => present(instance)
    }
  end
end

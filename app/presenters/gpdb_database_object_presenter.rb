class GpdbDatabaseObjectPresenter < Presenter
  delegate :id, :name, :schema, :to => :model

  def to_hash
    {
      :id => id,
      :type => "SOURCE_TABLE",
      :object_name => h(name),
      :schema => present(schema)
    }
  end
end
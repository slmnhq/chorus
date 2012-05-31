class GpdbDatabaseObjectPresenter < Presenter
  delegate :id, :name, :schema, :comment, :to => :model

  def to_hash
    {
      :id => id,
      :type => "SOURCE_TABLE",
      :object_name => h(name),
      :schema => present(schema),
      :comment => comment
    }
  end
end

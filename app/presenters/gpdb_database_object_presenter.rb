class GpdbDatabaseObjectPresenter < Presenter
  delegate :id, :name, :schema, :column_count, :description, :to => :model

  def to_hash
    {
      :id => id,
      :type => "SOURCE_TABLE",
      :object_name => h(name),
      :schema => present(schema),
      :description => description,
      :column_count => column_count
    }
  end
end

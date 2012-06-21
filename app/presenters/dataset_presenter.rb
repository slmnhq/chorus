class DatasetPresenter < Presenter
  delegate :id, :name, :schema, :to => :model

  def to_hash
    {
      :id => id,
      :type => "SOURCE_TABLE",
      :object_name => h(name),
      :schema => present(schema)
    }.merge(workspace_hash)
  end

  def workspace_hash
    options[:workspace] ? { :workspace => present(options[:workspace]) } : {}
  end
end

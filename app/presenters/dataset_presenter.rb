class DatasetPresenter < Presenter
  delegate :id, :name, :schema, :bound_workspaces, :to => :model

  def to_hash
    {
      :id => id,
      :type => "SOURCE_TABLE",
      :object_name => h(name),
      :schema => present(schema)
    }.merge(workspace_hash).merge(associated_workspaces_hash)
  end

  def workspace_hash
    options[:workspace] ? { :workspace => present(options[:workspace]) } : {}
  end
  
  def associated_workspaces_hash
    workspaces = bound_workspaces.map do |workspace|
      {:id => workspace.id, :name => workspace.name}
    end

    {:associated_workspaces => workspaces}
  end
end

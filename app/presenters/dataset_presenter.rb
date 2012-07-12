class DatasetPresenter < Presenter
  delegate :id, :name, :schema, :source_dataset_for, :bound_workspaces, :api_type, :to => :model

  def to_hash
    {
      :id => id,
      :type => thetype,
      :object_name => h(name),
      :schema => present(schema)
    }.merge(workspace_hash).merge(associated_workspaces_hash)
  end

  def thetype
    if options[:workspace] && !source_dataset_for(options[:workspace])
      "SANDBOX_TABLE"
    else
      "SOURCE_TABLE"
    end
  end

  def workspace_hash
    options[:workspace] ? {:workspace => present(options[:workspace])} : {}
  end

  def associated_workspaces_hash
    workspaces = bound_workspaces.map do |workspace|
      {:id => workspace.id, :name => workspace.name}
    end

    {:associated_workspaces => workspaces}
  end
end

class DatasetPresenter < Presenter
  delegate :id, :name, :schema, :source_dataset_for, :bound_workspaces, :import_schedules, :api_type, :to => :model

  def to_hash
    {
      :id => id,
      :type => thetype,
      :object_name => h(name),
      :schema => schema_hash,
      :hasCredentials => model.accessible_to(current_user)
    }.merge(workspace_hash).merge(associated_workspaces_hash).merge(frequency)
  end

  private

  def schema_hash
    rendering_activities? ? {:id => model.schema_id } : present(schema)
  end

  def thetype
    if options[:workspace] && !source_dataset_for(options[:workspace])
      "SANDBOX_TABLE"
    else
      "SOURCE_TABLE"
    end
  end

  def workspace_hash
    options[:workspace] ? {:workspace => present(options[:workspace], @options)} : {}
  end

  def frequency
    if options[:workspace] && options[:workspace].id
      import_schedule = import_schedules.where("workspace_id = #{options[:workspace].id}")
      {:frequency => import_schedule.first ? import_schedule.first.frequency : ""}
    else
      {:frequency => ""}
    end
  end

  def associated_workspaces_hash
    return {:associated_workspaces => []} if rendering_activities?
    workspaces = bound_workspaces.map do |workspace|
      {:id => workspace.id, :name => workspace.name}
    end

    {:associated_workspaces => workspaces}
  end
end

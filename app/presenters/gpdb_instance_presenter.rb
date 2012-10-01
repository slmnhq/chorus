class GpdbInstancePresenter < Presenter
  delegate :name, :host, :port, :id, :owner, :state, :shared, :provision_type,
           :maintenance_db, :description, :instance_provider, :version, :used_by_workspaces, to: :model

  def to_hash
    {
      :name => h(name),
      :host => h(host),
      :port => port,
      :id => id,
      :owner => present(owner),
      :shared => shared,
      :state => state,
      :provision_type => provision_type,
      :maintenance_db => maintenance_db,
      :description => description,
      :instance_provider => instance_provider,
      :version => version
    }.merge(workspace_hash)
  end

  def workspace_hash
    return {} unless @options[:size_only]
    return { :used_by_workspaces => nil } if model.account_for_user(current_user).nil?

    workspaces = used_by_workspaces

    total_size_in_bytes = workspaces.collect { |workspace| workspace.sandbox.disk_space_used(model.account_for_user!(current_user)) }.compact.sum
    {
        :used_by_workspaces => present(workspaces, @options),
        :sandboxes_size => @view_context.number_to_human_size(total_size_in_bytes)
    }
  end

  def complete_json?
    true
  end
end

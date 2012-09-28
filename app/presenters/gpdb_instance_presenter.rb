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
    workspaces = used_by_workspaces
    return { :used_by_workspaces => nil } if workspaces.nil?

    arr = workspaces.map do |workspace|
      gpdb_schema = GpdbSchema.find(workspace.sandbox_id)
      hash = Hash.new()
      hash[:size] = 0 # TODO: need real value
      hash[:schemaName] = gpdb_schema.name if gpdb_schema.present?
      hash[:databaseName] = gpdb_schema.database.name if gpdb_schema.present?
      hash[:ownerFullName] = "#{owner.first_name} #{owner.last_name}"
      hash
    end

    {
        :used_by_workspaces => (arr if model.is_a?(GpdbInstance))
    }
  end
end

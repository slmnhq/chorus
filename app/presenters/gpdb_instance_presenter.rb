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
      :version => version,
      :used_by_workspaces => (used_by_workspaces if model.is_a?(GpdbInstance))
    }
  end
end

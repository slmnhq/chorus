class InstancePresenter < Presenter
  delegate :name, :host, :port, :id, :owner, :state, :shared, :provision_type, :maintenance_db, :description, :instance_provider, to: :model

  def to_hash
    {
        :name => h(name),
        :host => h(host),
        :port => port,
        :id => id,
        :owner => present(owner),
        :shared => shared,
        :state => state,
        :provision_type =>  provision_type,
        :maintenance_db => maintenance_db,
        :description => description,
        :instance_provider =>  instance_provider
    }
  end
end

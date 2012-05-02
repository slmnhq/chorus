class InstancePresenter < Presenter
  delegate :name, :host, :port, :id, :owner, :provision_type, :maintenance_db, :description, to: :model

  def to_hash
    {
        :name => h(name),
        :host => h(host),
        :port => port,
        :id => id,
        :owner => present(owner),
        :provision_type => provision_type,
        :maintenance_db => maintenance_db,
        :description => description
    }
  end
end

class InstancePresenter < Presenter
  delegate :name, :host, :port, :id, to: :model

  def to_hash
    {
        :name => h(name),
        :host => h(host),
        :port => port,
        :id => id
    }
  end
end

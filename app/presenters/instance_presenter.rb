class InstancePresenter < Presenter
  delegate :name, :host, :port, :id, to: :model

  def to_hash
    {
        :name => name,
        :host => host,
        :port => port,
        :id => id
    }
  end
end

class InstancePresenter < Presenter
  delegate :name, :host, :port, :id, :owner, to: :model

  def to_hash
    {
        :name => h(name),
        :host => h(host),
        :port => port,
        :id => id,
        :owner => UserPresenter.new(owner, @view_context)
    }
  end
end

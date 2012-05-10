class HadoopInstancePresenter < Presenter
  delegate :name, :host, :port, :id, :owner, :description, :version, :state, to: :model

  def to_hash
    {
        :name => h(name),
        :host => h(host),
        :port => port,
        :id => id,
        :owner => present(owner),
        :state => state,
        :description => description,
        :version => version
    }
  end
end

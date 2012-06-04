class HadoopInstancePresenter < Presenter
  delegate :name, :host, :port, :id, :owner, :description, :version, :online?, :username, :group_list, to: :model

  def to_hash
    {
        :name => h(name),
        :host => h(host),
        :port => port,
        :id => id,
        :owner => present(owner),
        :state => online? ? "online" :"offline",
        :description => description,
        :version => version,
        :username => username,
        :group_list => group_list
    }
  end
end

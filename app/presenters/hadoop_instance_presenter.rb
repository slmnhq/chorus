class HadoopInstancePresenter < Presenter
  delegate :name, :host, :port, :id, :owner, :description, :version, :username, :group_list, to: :model

  def to_hash
    {
        :name => h(name),
        :host => h(host),
        :port => port,
        :id => id,
        :owner => present(owner),
        :state => model.state,
        :description => description,
        :version => version,
        :username => username,
        :group_list => group_list,
        :entity_type => "hadoop_instance"
    }
  end

  def complete_json?
    true
  end
end

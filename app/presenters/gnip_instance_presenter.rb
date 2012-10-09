class GnipInstancePresenter < Presenter
  delegate :name, :host, :port, :id, :owner, :description, :username, :password, to: :model

  def to_hash
    {
        :name => h(name),
        :host => h(host),
        :port => port,
        :id => id,
        :owner => owner,
        :description => description,
        :username => username,
        :password => password
    }
  end

  def complete_json?
    true
  end
end

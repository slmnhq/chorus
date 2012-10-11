class GnipInstancePresenter < Presenter
  delegate :name, :stream_url, :id, :owner, :description, :username, :password, to: :model

  def to_hash
    {
        :name => h(name),
        :stream_url => h(stream_url),
        :id => id,
        :owner => owner,
        :description => description,
        :username => username,
        :password => password,
        :state => "online"
    }
  end

  def complete_json?
    true
  end
end

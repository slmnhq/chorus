class UserPresenter < Presenter
  delegate :username, to: :model

  def to_hash
    {
        :username => username
    }
  end
end
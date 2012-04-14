class UserPresenter < Presenter
  def to_hash
    {
        :username => self.model.username
    }
  end
end
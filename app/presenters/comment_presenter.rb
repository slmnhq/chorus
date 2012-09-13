class CommentPresenter < Presenter
  delegate :author, :body, :to => :model

  def to_hash
    {
        :author => present(author),
        :body => body
    }
  end
end
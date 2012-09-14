class CommentPresenter < Presenter
  delegate :author, :text, :to => :model

  def to_hash
    {
        :author => present(author),
        :text => text
    }
  end
end
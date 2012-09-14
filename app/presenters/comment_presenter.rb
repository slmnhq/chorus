class CommentPresenter < Presenter
  delegate :author, :text, :created_at, :to => :model

  def to_hash
    {
        :author => present(author),
        :text => text,
        :timestamp => created_at
    }
  end
end
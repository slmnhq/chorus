class CommentPresenter < Presenter
  delegate :id, :author, :text, :created_at, :to => :model

  def to_hash
    {
        :id => id,
        :author => present(author),
        :text => text,
        :timestamp => created_at
    }
  end
end
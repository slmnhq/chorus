class CommentPresenter < Presenter
  delegate :id, :author, :text, :created_at, :to => :model

  def to_hash
    {
        :id => id,
        :author => present(author),
        :text => text,
        :action => 'SUB_COMMENT',
        :timestamp => created_at
    }
  end

  def complete_json?
    true
  end
end
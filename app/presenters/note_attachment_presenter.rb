class NoteAttachmentPresenter < Presenter
  delegate :id, :contents, :created_at, to: :model

  def to_hash
    {
        :id => id,
        :file_name => contents.original_filename,
        :timestamp => created_at
    }
  end
end

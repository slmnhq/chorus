class NoteAttachmentPresenter < Presenter
  delegate :id, :contents, :created_at, to: :model

  def to_hash
    {
        :id => id,
        :name => contents.original_filename,
        :timestamp => created_at,
        :entity_type => "file",
        :type => File.extname(contents.original_filename).sub(/^\./, '')
    }
  end
end

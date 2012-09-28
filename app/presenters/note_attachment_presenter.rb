class NoteAttachmentPresenter < Presenter
  delegate :id, :contents, :created_at, :contents_are_image?, to: :model

  def to_hash
    {
        :id => id,
        :name => contents.original_filename,
        :timestamp => created_at,
        :icon_url => contents_are_image? ? model.contents.url(:icon) : nil ,
        :entity_type => "file",
        :type => File.extname(contents.original_filename).sub(/^\./, '')
    }
  end

  def complete_json?
    true
  end
end

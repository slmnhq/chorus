class NoteAttachmentMigrator
  def migrate
    get_file do | comment_id, chorus_rails_event_id, file_name , file|
      event = Events::Base.find_by_id(chorus_rails_event_id)
      unless event
        next
      end

      note_attachment = NoteAttachment.new
      note_attachment.contents_file_name = file_name
      note_attachment.note_id = event.id
      note_attachment.contents = file
      note_attachment.save!
    end
  end

  def get_file
    sql = "SELECT ec.id AS comment_id, ef.file file, ec.chorus_rails_event_id event_id, ef.file_name FROM edc_file ef, edc_comment ec, edc_comment_artifact eca WHERE eca.entity_type = 'file' AND eca.comment_id = ec.id AND eca.entity_id = ef.id AND ec.is_deleted = false AND eca.is_deleted = false AND ef.is_deleted = false"
    comment_file_data = Legacy.connection.exec_query(sql)
    comment_file_data.map do |comment_data|
      yield comment_data["comment_id"], comment_data["event_id"], comment_data["ef.file_name"], comment_data["ef.file"]
    end
  end
end


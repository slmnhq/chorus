class NoteAttachmentMigrator < AbstractMigrator
  class << self
    def classes_to_validate
      [NoteAttachment]
    end

    def migrate
      get_file do |chorus_rails_event_id, file_name , file|
        event = Events::Base.find_by_id(chorus_rails_event_id)
        unless event
          next
        end

        note_attachment = NoteAttachment.new
        note_attachment.note_id = event.id

        fake_file = FakeFileUpload.new(file)
        fake_file.original_filename = file_name
        fake_file.content_type = MIME::Types.type_for(file_name)

        note_attachment.contents = fake_file
        note_attachment.save!
      end

      get_dataset do |associated_dataset_id, event_id|
        note = Events::Note.find_by_id(event_id)
        dataset_association = AssociatedDataset.find_by_id(associated_dataset_id)
        next unless note && dataset_association

        dataset = dataset_association.dataset
        note.datasets << dataset
      end
    end

    def get_file
      sql = "SELECT ef.file file, ec.chorus_rails_event_id event_id, ef.file_name file_name FROM edc_file ef, edc_comment ec, edc_comment_artifact eca WHERE eca.entity_type = 'file' AND eca.comment_id = ec.id AND eca.entity_id = ef.id AND ec.is_deleted = false AND eca.is_deleted = false AND ef.is_deleted = false"
      comment_file_data = Legacy.connection.exec_query(sql)
      comment_file_data.map do |comment_data|
        yield comment_data["event_id"], comment_data["file_name"], comment_data["file"]
      end
    end

    class FakeFileUpload < StringIO
      attr_accessor :content_type, :original_filename
    end

    def get_dataset
      sql = <<-SQL
      SELECT
        ed.chorus_rails_associated_dataset_id as dataset_id,
        ec.chorus_rails_event_id as event_id
      FROM edc_dataset ed, edc_comment ec, edc_comment_artifact eca
      WHERE eca.entity_type = 'databaseObject'
        AND ed.type = 'SOURCE_TABLE'
        AND eca.comment_id = ec.id
        AND eca.entity_id = ed.composite_id
        AND ec.is_deleted = false
        AND eca.is_deleted = false
        AND ed.is_deleted = false
      SQL

      comment_file_data = Legacy.connection.exec_query(sql)
      comment_file_data.map do |comment_data|
        yield comment_data["dataset_id"], comment_data["event_id"]
      end
    end
  end
end
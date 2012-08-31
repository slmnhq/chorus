class NoteAttachmentMigrator < AbstractMigrator
  class << self
    def prerequisites(options)
      NoteMigrator.migrate(options)
      ensure_legacy_id :notes_workfiles
      ensure_legacy_id :datasets_notes
      ensure_legacy_id :note_attachments
    end

    def classes_to_validate
      [
      ]
    end

    def migrate(options)
      prerequisites(options)
      migrate_workfiles_attachment_on_notes
      migrate_dataset_attachment_on_notes
      migrate_desktop_attachment_on_notes
    end

    private

    def migrate_workfiles_attachment_on_notes
      Legacy.connection.exec_query(%Q(
      INSERT INTO notes_workfiles(
        legacy_id,
        note_id,
        workfile_id
        )
      SELECT
        edc_comment_artifact.id,
        events.id,
        workfiles.id
      FROM
        edc_comment_artifact
        INNER JOIN edc_comment
          ON edc_comment.id = edc_comment_artifact.comment_id
        INNER JOIN workfiles
          ON workfiles.legacy_id = edc_comment_artifact.entity_id
        INNER JOIN events
          ON events.legacy_id = edc_comment_artifact.comment_id AND
          events.action LIKE 'Events::Note%'
      WHERE
        edc_comment_artifact.entity_type = 'workfile'
        AND edc_comment_artifact.id NOT IN (SELECT legacy_id from notes_workfiles );
      ))
    end

    def migrate_dataset_attachment_on_notes
      Legacy.connection.exec_query(%Q(
      INSERT INTO datasets_notes(
        legacy_id,
        note_id,
        dataset_id
        )
      SELECT
        edc_comment_artifact.id,
        events.id,
        datasets.id
      FROM
        edc_comment_artifact
        INNER JOIN edc_comment
          ON edc_comment.id = edc_comment_artifact.comment_id
        INNER JOIN datasets
          ON datasets.legacy_id = normalize_key(edc_comment_artifact.entity_id)
        INNER JOIN events
          ON events.legacy_id = edc_comment_artifact.comment_id AND
          events.action LIKE 'Events::Note%'
      WHERE
        edc_comment_artifact.entity_type = 'databaseObject'
        AND edc_comment_artifact.id NOT IN (SELECT legacy_id from datasets_notes );
      ))

    end


    def migrate_desktop_attachment_on_notes

      get_file do |note_legacy_id, file_name, file, attachment_legacy_id|
        event = Events::Note.find_with_destroyed(:first, :conditions => {:legacy_id => note_legacy_id})
        unless event
          next
        end

        note_attachment = NoteAttachment.new
        note_attachment.note_id = event.id

        fake_file = FakeFileUpload.new(file)
        fake_file.original_filename = file_name
        fake_file.content_type = MIME::Types.type_for(file_name).first

        note_attachment.contents = fake_file
        note_attachment.legacy_id = attachment_legacy_id
        note_attachment.save!
      end
    end

    def get_file
      sql = "SELECT ef.file file, ec.id note_legacy_id, ef.file_name file_name , eca.id attachment_legacy_id
      FROM edc_file ef, edc_comment ec, edc_comment_artifact eca WHERE eca.entity_type = 'file' AND
      eca.comment_id = ec.id AND eca.entity_id = ef.id AND eca.id NOT IN (SELECT legacy_id from note_attachments );"
      comment_file_data = Legacy.connection.exec_query(sql)
      comment_file_data.map do |comment_data|
        yield comment_data["note_legacy_id"], comment_data["file_name"], comment_data["file"], comment_data["attachment_legacy_id"]
      end
    end

    class FakeFileUpload < StringIO
      attr_accessor :content_type, :original_filename
    end

  end
end

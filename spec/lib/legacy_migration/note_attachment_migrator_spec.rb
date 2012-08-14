require 'spec_helper'

describe NoteAttachmentMigrator, :legacy_migration => true, :type => :legacy_migration do
  before do
    UserMigrator.new.migrate
    InstanceMigrator.new.migrate
    HadoopInstanceMigrator.new.migrate
    WorkspaceMigrator.new.migrate
    MembershipMigrator.new.migrate
    WorkfileMigrator.new.migrate
    NoteCommentMigrator.new.migrate
    AssociatedDatasetMigrator.new.migrate
  end

  it "changes the number of note attachments" do
    expect { NoteAttachmentMigrator.new.migrate }.to change(NoteAttachment, :count).by(24)
  end

  it "migrates all note file attachments" do
    NoteAttachmentMigrator.new.migrate
    Legacy.connection.select_all("SELECT ec.id AS comment_id, ef.file file, ec.chorus_rails_event_id, ef.file_name FROM edc_file ef, edc_comment ec, edc_comment_artifact eca WHERE eca.entity_type = 'file' AND eca.comment_id = ec.id AND eca.entity_id = ef.id AND ec.is_deleted = false AND eca.is_deleted = false AND ef.is_deleted = false").each do |legacy_attachment|
      attachment = NoteAttachment.find_by_note_id(legacy_attachment["chorus_rails_event_id"])
      if attachment
        attachment.contents_file_name.should == legacy_attachment["file_name"].gsub(" ", "_")
        attachment.note_id.should == legacy_attachment["chorus_rails_event_id"]
        File.open(attachment.contents.path, 'rb').read.should == legacy_attachment["file"]
      end
    end
  end

  it "migrates all note dataset attachments" do
    NoteAttachmentMigrator.new.migrate
    Legacy.connection.select_all("SELECT ec.id AS comment_id, ec.workspace_id as workspace_id, ed.id as dataset_id, ec.chorus_rails_event_id  FROM edc_dataset ed, edc_comment ec, edc_comment_artifact eca WHERE eca.entity_type = 'databaseObject' AND eca.comment_id = ec.id AND eca.entity_id = ed.composite_id AND ec.is_deleted = false AND eca.is_deleted = false AND ed.is_deleted = false").each do |legacy_dataset_attachment|
      note = Events::Base.find_by_id(legacy_dataset_attachment["chorus_rails_event_id"])
      original_comment_id = legacy_dataset_attachment["comment_id"]
      if note # TODO: remove this check once notes on all types of things have been implemented. currently, unimplemented notes with attachments will break this test
        Legacy.connection.select_all("select ed.chorus_rails_associated_dataset_id, ec.id as comment_id, eca.id as artifact_id, eca.entity_type, eca.entity_id as artifact_entity_id FROM edc_comment_artifact eca JOIN edc_dataset ed ON ed.composite_id = eca.entity_id JOIN edc_comment ec ON ec.id = eca.comment_id WHERE eca.entity_type = 'databaseObject' AND ec.id = '#{original_comment_id}' AND ec.is_deleted = false AND eca.is_deleted = false AND ed.is_deleted = false").each do |dataset|
          note.datasets.should include(AssociatedDataset.find(dataset["chorus_rails_associated_dataset_id"]).dataset)
        end
      end
    end
  end
end

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
  end

  it "changes the number of note attachments" do
    expect { NoteAttachmentMigrator.new.migrate }.to change(NoteAttachment, :count).by(5)
  end

  it "migrates all note attachments" do
    NoteAttachmentMigrator.new.migrate
    Legacy.connection.select_all("SELECT ec.id AS comment_id, ef.file file, ec.chorus_rails_event_id, ef.file_name FROM edc_file ef, edc_comment ec, edc_comment_artifact eca WHERE eca.entity_type = 'file' AND eca.comment_id = ec.id AND eca.entity_id = ef.id AND ec.is_deleted = false AND eca.is_deleted = false AND ef.is_deleted = false").each do |legacy_attachment|
      attachment = NoteAttachment.find_by_id(legacy_attachment["chorus_rails_event_id"])
      next unless attachment

      path = File.join(Chorus::Application.config.rails_root, "system", legacy_attachment["file_name"])
      contents = StringIO.new(File.read(path))

      attachment.filename.should = legacy_attachment["file_name"]
      attachment.note_id.should = legacy_attachment["chorus_rails_event_id"]
      contents.should == legacy_attachment["file"]
    end
  end
end

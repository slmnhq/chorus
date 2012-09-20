require 'legacy_migration_spec_helper'

describe NotificationMigrator do
  before :all do
    any_instance_of(WorkfileMigrator::LegacyFilePath) do |p|
      # Stub everything with a PNG so paperclip doesn't blow up
      stub(p).path { File.join(Rails.root, "spec/fixtures/small2.png") }
    end

    NotificationMigrator.migrate('workfile_path' => SPEC_WORKFILE_PATH)
  end

  describe ".migrate" do
    it "creates new notifications for legacy notifications" do
      count = 0
      Legacy.connection.select_all("
        SELECT ea.*
        FROM edc_alert ea
        WHERE type IN ('NOTE', 'MEMBERS_ADDED', 'NOTE_COMMENT');
      ").each do |legacy_alert|
        count += 1

        notification = Notification.unscoped.find_by_legacy_id(legacy_alert["id"])

        recipient = User.find(notification.recipient_id)
        recipient.legacy_id.should == legacy_alert["recipient"]

        notification.created_at.should == legacy_alert["created_stamp"]
        notification.updated_at.should == legacy_alert["last_updated_stamp"]
        notification.read.should == (legacy_alert["is_read"] == 't' ? true : false)

        if legacy_alert["is_deleted"] == "t"
          notification.deleted_at.should_not be_nil
        else
          notification.deleted_at.should be_nil
        end
      end

      Notification.unscoped.count.should == count
      NotificationMigrator.migrate('workfile_path' => SPEC_WORKFILE_PATH)
      Notification.unscoped.count.should == count
    end

    it "migrates the notes" do
      count = 0
      Legacy.connection.select_all("
        SELECT ea.*
        FROM edc_alert ea
        WHERE type = 'NOTE';
      ").each do |legacy_alert|
        count += 1

        notification = Notification.unscoped.find_by_legacy_id(legacy_alert["id"])
        event = Events::Base.find(notification.event_id)
        event.legacy_id.should == legacy_alert["reference"]

      end
      count.should > 0
      note_count = Notification.unscoped.where(:comment_id => nil).select do |notification|
        notification.notification_event.legacy_type == 'edc_comment'
      end.count
      count.should == note_count
    end

    it "migrates the note_comments" do
      count = 0
      Legacy.connection.select_all("
        SELECT ea.*
        FROM edc_alert ea
        WHERE type = 'NOTE_COMMENT';
      ").each do |legacy_alert|
        count += 1
        notification = Notification.unscoped.find_by_legacy_id(legacy_alert["id"])

        comment = Comment.unscoped.find(notification.comment_id)
        event = Events::Base.find(notification.event_id)
        comment.legacy_id.should == legacy_alert["reference"]
        event.should == comment.event
      end
      count.should > 0
      Notification.unscoped.where("comment_id is not null").count.should == count
    end

    it "migrates the notification for MEMBERS_ADDED to a workspace" do
      count = 0
      Legacy.connection.select_all("
        SELECT ea.*
        FROM edc_alert ea
        WHERE type = 'MEMBERS_ADDED';
      ").each do |legacy_alert|
        count += 1

        notification = Notification.unscoped.find_by_legacy_id(legacy_alert["id"])
        event = Events::Base.find(notification.event_id)
        event.workspace_id == Workspace.find_by_legacy_id(legacy_alert["reference"]).id
      end
      count.should > 0
      note_count = Notification.unscoped.all.select do |notification|
        notification.notification_event.action == 'MembersAdded'
      end.count
      count.should == note_count
    end
  end
end
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
      count = Legacy.connection.select_all("SELECT count(*) FROM edc_alert WHERE type = 'NOTE'").first["count"]
      Notification.unscoped.count.should == count
      NotificationMigrator.migrate('workfile_path' => SPEC_WORKFILE_PATH)
      Notification.unscoped.count.should == count
    end

    it "migrates the notes" do
      count = 0
      Legacy.connection.select_all("
        SELECT ea.*
        FROM edc_alert ea
        WHERE type = 'NOTE'
      ").each do |legacy_comment|
        count += 1
        notification = Notification.find_by_legacy_id(legacy_comment["id"])

        recipient = User.find(notification.recipient_id)
        recipient.legacy_id.should == legacy_comment["recipient"]

        event = Events::Base.find(notification.event_id)
        event.legacy_id.should == legacy_comment["reference"]

        notification.created_at.should == legacy_comment["created_stamp"]
        notification.updated_at.should == legacy_comment["last_updated_stamp"]
      end
      count.should > 0
      Notification.count.should == count
    end
  end
end
require 'spec_helper'

describe GnipImporter do
  let(:gnip_import_created_event) { events(:gnip_stream_import_created) }
  let(:csv_file) { csv_files(:default) }

  describe "#create_success_event" do
    before do
      importer = GnipImporter.new(csv_file.id, gnip_import_created_event.id);
      importer.create_success_event
    end

    it "creates an import stream success event" do
      expect {
        importer = GnipImporter.new(csv_file.id, gnip_import_created_event.id);
        importer.create_success_event
      }.to change(Events::GnipStreamImportSuccess, :count).by(1)
    end

    it "creates a success event with correct attributes" do
      event = Events::GnipStreamImportSuccess.last
      event.actor.should == gnip_import_created_event.actor
      event.dataset.should == gnip_import_created_event.dataset
      event.workspace.should == gnip_import_created_event.workspace
    end

    it "creates notification for actor on import success" do
      notification = Notification.last
      notification.recipient_id.should == gnip_import_created_event.actor.id
      notification.event_id.should == Events::GnipStreamImportSuccess.last.id
    end
  end

  describe "#create_failure_event" do
    let(:error_message) { "sample error message" }
    before do
      importer = GnipImporter.new(csv_file.id, gnip_import_created_event.id);
      importer.create_failure_event(error_message)
    end

    it "creates an import stream success event" do
      expect {
        importer = GnipImporter.new(csv_file.id, gnip_import_created_event.id);
        importer.create_failure_event(error_message)
      }.to change(Events::GnipStreamImportFailed, :count).by(1)
    end

    it "creates a failure event with correct attributes" do
      event = Events::GnipStreamImportFailed.last
      event.actor.should == gnip_import_created_event.actor
      event.dataset.should == gnip_import_created_event.dataset
      event.workspace.should == gnip_import_created_event.workspace
    end

    it "creates notification for actor on import failure" do
      notification = Notification.last
      notification.recipient_id.should == gnip_import_created_event.actor.id
      notification.event_id.should == Events::GnipStreamImportFailed.last.id
    end
  end

end
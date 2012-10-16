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

  describe "#import_to_table" do
    let(:user) { users(:owner) }
    let(:gnip_csv_result_mock) { GnipCsvResult.new("a,b,c\n1,2,3") }
    let(:gnip_instance) { gnip_instances(:default) }
    let(:workspace) { workspaces(:public) }

    context "ChorusGnip imports successfully" do
      before do
        mock(ChorusGnip).from_stream(gnip_instance.stream_url,
                                     gnip_instance.username,
                                     gnip_instance.password) do |c|
          o = Object.new
          stub(o).to_result { gnip_csv_result_mock }
        end

        mock(GnipImporter).import_file(anything, gnip_import_created_event)
      end

      it "creates a csv file and passes it to import_file" do
        expect {
          GnipImporter.import_to_table('foobar', gnip_instance.id,
                                       workspace.id, user.id, gnip_import_created_event.id)
        }.to change(CsvFile, :count).by(1)

        file = CsvFile.last
        file.contents.should_not be_nil
        file.column_names.should == gnip_csv_result_mock.column_names
        file.types.should == ['text', 'text']
        file.delimiter.should == ","
        file.to_table.should == 'foobar'
        file.new_table.should == true
        file.user.should == user
        file.workspace.should == workspace
      end
    end

    context "ChorusGnip or something else raises an exception" do
      before do
        mock(ChorusGnip).from_stream(gnip_instance.stream_url,
                                     gnip_instance.username,
                                     gnip_instance.password) do |c|
          raise Exception, "mock exception from test"
        end

        dont_allow(GnipImporter).import_file
      end

      it "creates a csv file and passes it to import_file" do
        expect do
          GnipImporter.import_to_table('foobar', gnip_instance.id,
                                       workspace.id, user.id, gnip_import_created_event.id)
        end.to change(Events::GnipStreamImportFailed, :count).by(1)
      end
    end
  end
end
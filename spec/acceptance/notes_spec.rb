require 'spec_helper'

resource "Notes" do
  let(:user) { users(:bob) }
  let(:note) { FactoryGirl.create :note_on_hdfs_file_event, :actor => user }
  let!(:instance) { FactoryGirl.create(:instance, :id => 123) }
  let!(:attachment) { note_attachments(:sql) }

  before do
    log_in user
  end

  post "/notes" do
    parameter :body, "Text body of the note"
    parameter :entity_type, "Type of object the note is being posted on"
    parameter :entity_id, "Id of the object the note is being posted on"

    scope_parameters :note, :all


    let(:body) { note.body }
    let(:entity_type) { "greenplum_instance" }
    let(:entity_id) { "123" }

    example_request "Post a new note on a Greenplum instance" do
      status.should == 201
    end
  end

  post "/notes" do
    parameter :body, "Text body of the note"
    parameter :entity_type, "Type of object the note is being posted on"
    parameter :entity_id, "Id of the object the note is being posted on"

    scope_parameters :note, :all

    let(:body) { note.body }
    let(:entity_type) { "hdfs_file" }
    let(:entity_id) { "1|/fake/path/to/a/file.txt" }

    example_request "Post a new note on a HDFS file" do
      status.should == 201
    end
  end

  put "/notes/:id" do
    parameter :id, "Note id"
    parameter :body, "New text body of the note"

    required_parameters :id
    scope_parameters :note, :all

    let(:id) { note.id }
    let(:body) { "New text" }

    example_request "Changes the body of a note" do
      status.should == 200
    end
  end

  delete "/notes/:id" do
    parameter :id, "Note id"

    required_parameters :id

    let(:id) { note.id }

    example_request "Deletes a note" do
      status.should == 200
    end
  end

  post "/notes/:note_id/attachments" do
    parameter :note_id, "Note id"
    parameter :contents, "File contents"

    required_parameters :note_id, :contents
    scope_parameters :fileToUpload, :all

    let(:note_id) { note.id }
    let(:contents) { test_file("small1.gif") }

    example_request "Attaches the contents of a file to a note" do
      status.should == 200
    end
  end

  get "/notes/:note_id/attachments/:id" do
    parameter :note_id, "Note id"
    parameter :id, "Attachment id"

    required_parameters :note_id, :id

    let(:note_id) { note.id }
    let(:id) { attachment.id }

    example_request "Shows the contents of an attachment" do
      status.should == 200
    end
  end
end

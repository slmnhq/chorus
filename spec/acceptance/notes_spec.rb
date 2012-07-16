require 'spec_helper'

resource "Notes" do
  let(:user) { FactoryGirl.create :user }
  let(:note) { FactoryGirl.create :note_on_hdfs_file_event }
  let!(:instance) { FactoryGirl.create(:instance, :id => 123) }

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
    let(:entity_type) { "hdfs" }
    let(:entity_id) { "1|/fake/path/to/a/file.txt" }

    example_request "Post a new note on a HDFS file" do
      status.should == 201
    end
  end
end

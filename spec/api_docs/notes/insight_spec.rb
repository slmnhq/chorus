require 'spec_helper'

resource "Notes" do
  let(:user) { users(:owner) }
  let(:note) { Events::NoteOnGreenplumInstance.last }
  let(:note_on_workspace) { Events::NoteOnWorkspace.first }

  before do
    log_in user
    note_on_workspace.insight = true
    note_on_workspace.save!
  end

  post "/insights/promote" do
    parameter :note_id, "Id of the Note being promoted"

    let(:note_id) { note.id }

    example_request "Promote the note to insight" do
      status.should == 201
    end
  end

  post "/insights/publish" do
    parameter :note_id, "Id of the Note being published"

    let(:note_id) {note_on_workspace.id}

    example_request "publish the insight" do
      status.should == 201
    end
  end

  post "/insights/unpublish" do
    before do
      note_on_workspace.published = true
      note_on_workspace.save!
    end
    parameter :note_id, "Id of the Note being unpublished"

    let(:note_id) {note_on_workspace.id}

    example_request "unpublish the insight" do
      status.should == 201
    end
  end

  get "/insights" do
    parameter :entity_id, "Entity Id for filtering insights"
    parameter :entity_type, "Entity_type (dashboard or workspace)"

    required_parameters :entity_type

    let(:entity_type) {"workspace"}
    let(:entity_id) {1}

    example_request "Get the list of notes that are insights" do
      status.should == 200
    end
  end

  get "/insights/count" do
    parameter :entity_id, "Entity Id for filtering insights"
    parameter :entity_type, "Entity_type (dashboard or workspace)"

    required_parameters :entity_type

    let(:entity_type) {"dashboard"}
    example_request "Get the number of notes that are insights" do
      status.should == 200
    end
  end
end

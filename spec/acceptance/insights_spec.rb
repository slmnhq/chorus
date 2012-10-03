require 'spec_helper'

resource "Insights" do
  let(:user) { users(:owner) }
  let(:note) { Events::NoteOnGreenplumInstance.first }

  before do
    log_in user
  end

  post "/insights" do
    parameter :note_id, "Id of the Note is being promoted"

    let(:note_id) { note.id }

    example_request "promote the note to insight" do
      status.should == 201
    end
  end

  get "/insights" do
    parameter :entity_id, "Entity Id for filtering insights"
    parameter :entity_type, "Entity_type (dashboard or workspace)"

    required_parameters :entity_type

    let(:entity_type) {"workspace"}
    let(:entity_id) {1}

    example_request "get the list of insights" do
      status.should == 200
    end
  end

  get "/insights/count" do

    parameter :entity_id, "Entity Id for filtering insights"
    parameter :entity_type, "Entity_type (dashboard or workspace)"

    required_parameters :entity_type

    let(:entity_type) {"dashboard"}
    example_request "get the number of insights" do
      status.should == 200
    end
  end

  get "/insights/count" do

    parameter :entity_id, "Entity Id for filtering insights"
    parameter :entity_type, "Entity_type (dashboard or workspace)"

    required_parameters :entity_type

    let(:entity_type) {"dashboard"}
    example_request "get the number of insights" do
      status.should == 200
    end
  end

end

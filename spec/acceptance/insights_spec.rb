require 'spec_helper'

resource "Insights" do
  let(:user) { users(:owner) }
  let(:note) { Events::NoteOnGreenplumInstance.first }

  before do
    log_in user
  end

  post "/insights" do
    parameter :note_id, "Id of the Note is being promoted"

    scope_parameters :insight, :all


    let(:note_id) { note.id }

    example_request "promote the note to insight" do
      status.should == 201
    end
  end
end

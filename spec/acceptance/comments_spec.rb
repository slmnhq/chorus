require 'spec_helper'

resource "Comments" do
  let(:author) { users(:bob) }
  let(:event) { events(:note_on_bob_public_workfile) }

  before do
    log_in author
  end

  post "/comments" do
    parameter :text, "Text of the comment"
    parameter :event_id, "Event id"

    required_parameters :text, :event_id
    scope_parameters :comment, :all

    let(:text) { "cookiemonster" }
    let(:event_id) { "12323029" }

    example_request "Create a comment" do
      status.should == 201
    end
  end

  get "/comments/:id" do
    let(:id) { comments(:comment_on_note_on_greenplum).id }

    example_request "Get a comment" do
      status.should == 200
    end
  end
end
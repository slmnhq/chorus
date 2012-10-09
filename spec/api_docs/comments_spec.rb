require 'spec_helper'

resource "Comments" do
  let(:author) { users(:admin) }
  let(:event) { events(:note_on_no_collaborators_private) }
  let(:comment) { comments(:comment_on_note_on_no_collaborators_private) }

  before do
    log_in author
  end

  post "/comments" do
    parameter :text, "Text of the comment"
    parameter :event_id, "Event id"

    required_parameters :text, :event_id

    let(:text) { "cookiemonster" }
    let(:event_id) { event.id }

    example_request "Create a comment" do
      status.should == 201
    end
  end

  get "/comments/:id" do
    let(:id) { comment.id }

    parameter :id, "Comment id"

    example_request "Get a comment" do
      status.should == 200
    end
  end

  delete "/comments/:id" do
    let(:id) { comment.id }

    parameter :id, "Comment id"

    example_request "Delete a comment" do
      status.should == 200
    end
  end
end
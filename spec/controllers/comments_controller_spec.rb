require 'spec_helper'

describe CommentsController do
  let(:author) { users(:carly) }
  let(:event_id) { events(:note_on_bob_public_workfile).id }

  before do
    log_in author
  end

  describe "#create" do
    before do
      @params = {
          event_id: event_id,
          text: "hello world in jasmine test!"
      }
      post :create, { :comment => @params }
    end

    it "should post with appropriate response" do
      response.code.should == "201"
    end

    it "should create make the current user the author" do
      Comment.find_by_text(@params[:text]).author.should == author
    end
  end

  describe "#show" do
    let(:comment) { Comment.new({:event_id => event_id, :text => "Comment on a note", :author_id => author.id}) }
    before do
      comment.save!
    end
    it "presents the comment" do
      get :show, :id => comment.id
      decoded_response.text.should == "Comment on a note"
    end

    generate_fixture "comment.json" do

      get :show, :id => comment.id
    end
  end
end
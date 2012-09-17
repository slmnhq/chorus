require 'spec_helper'

describe CommentsController do
  let(:author) { users(:carly) }
  let(:event) { events(:note_on_bob_public_workfile) }

  before do
    log_in author
  end

  describe "#create" do
    before do
      @params = {
          event_id: event.id,
          text: "hello world in jasmine test!"
      }
    end

    it "uses authorization" do
      mock(subject).authorize! :create_comment_on, Comment, event
      post :create, { :comment => @params }
    end

    it "should post with appropriate response" do
      post :create, { :comment => @params }
      response.code.should == "201"
    end

    it "should create make the current user the author" do
      post :create, { :comment => @params }
      Comment.find_by_text(@params[:text]).author.should == author
    end
  end

  describe "#show" do
    let(:comment) { Comment.new({:event_id => event.id, :text => "Comment on a note", :author_id => author.id}) }
    before do
      comment.save!
    end

    it "uses authorization" do
      mock(subject).authorize! :show, comment
      get :show, :id => comment.id
    end

    it "presents the comment" do
      get :show, :id => comment.id
      decoded_response.text.should == "Comment on a note"
    end

    generate_fixture "comment.json" do

      get :show, :id => comment.id
    end
  end

  describe "#destroy" do    
    before do
      @comment = Comment.new({:event_id => event.id, :author_id => author.id, :text => "Delete me!"})
      @comment.save!
      log_in author
    end

    it "uses authorization" do
      mock(subject).authorize! :destroy, @comment
      delete :destroy, :id => @comment.id
    end

    describe "deleting" do
      before do
        delete :destroy, :id => @comment.id
      end

      it "should soft delete the comment" do        
        comment = Comment.find_with_destroyed(@comment.id)
        comment.deleted_at.should_not be_nil
      end

      it "should respond with success" do
        response.should be_success
      end
    end
  end
end
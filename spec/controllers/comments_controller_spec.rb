require 'spec_helper'

describe CommentsController do
  let(:event) { events(:note_on_bob_public_workfile) }
  let(:event_author) { users(:bob) }
  let(:first_commenter) { users(:the_collaborator) }
  let(:second_commenter) { users(:admin) }

  before do
    log_in commenter
  end

  let(:commenter) { event_author }

  describe "#create" do
    before do
      @params = {
          event_id: event.id,
          text: "hello world in jasmine test!"
      }
    end

    it "uses authorization" do
      mock(subject).authorize! :create_comment_on, Comment, event
      post :create, {:comment => @params}
    end

    it "should post with appropriate response" do
      post :create, {:comment => @params}
      response.code.should == "201"
    end

    it "should create make the current user the author" do
      post :create, {:comment => @params}
      Comment.find_by_text(@params[:text]).author.should == commenter
    end

    context "when event author comments" do
      before do
        Comment.create!({:event => event, :author => first_commenter, :text => "Nice event"}, :without_protection => true)
        Comment.create!({:event => event, :author => second_commenter, :text => "Great event"}, :without_protection => true)
        post :create, {:comment => @params}
      end

      it "notifies the other commenters" do
        Notification.where(:recipient_id => first_commenter.id, :event_id => event.id).should exist
        Notification.where(:recipient_id => second_commenter.id, :event_id => event.id).should exist
      end

      it "doesn't notify the event author" do
        Notification.where(:recipient_id => event_author.id, :event_id => event.id).should_not exist
      end
    end

    context "when someone else comments" do
      let(:commenter) { first_commenter }

      before do
        Comment.create!({:event => event, :author => second_commenter, :text => "I am a second comment"}, :without_protection => true)
        post :create, {:comment => @params}
      end

      it "notifies the event author" do
        Notification.where(:recipient_id => event_author.id, :event_id => event.id).should exist
      end

      it "doesn't notify the current commenter" do
        Notification.where(:recipient_id => commenter.id, :event_id => event.id).should_not exist
      end

      it "notifies other commenters" do
        Notification.where(:recipient_id => second_commenter.id, :event_id => event.id).should exist
      end
    end

    context "when some user's have commented multiple times" do
      before do
        Comment.create!(:event_id => event.id, :author_id => event_author.id, :text => "I comment on myself")
        Comment.create!(:event_id => event.id, :author_id => first_commenter.id, :text => "Great event")
        Comment.create!(:event_id => event.id, :author_id => first_commenter.id, :text => "Great event again")
      end

      let(:commenter) { second_commenter }

      it "only notifies the same user once" do
        expect {
          expect {
            post :create, {:comment => @params}
          }.to change {
            Notification.where(:recipient_id => event_author.id, :event_id => event.id).count
          }.by(1)
        }.to change {
          Notification.where(:recipient_id => first_commenter.id, :event_id => event.id).count
        }.by(1)
      end
    end
  end

  describe "#show" do
    let(:comment) { Comment.new({:event_id => event.id, :text => "Comment on a note", :author_id => commenter.id}) }
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
      @comment = Comment.new({:event_id => event.id, :author_id => commenter.id, :text => "Delete me!"})
      @comment.save!
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
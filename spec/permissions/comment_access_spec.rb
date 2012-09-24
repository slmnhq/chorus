require "spec_helper"

describe CommentAccess do
  let(:user_without_access) { users(:owner) }
  let(:user_with_access) { users(:the_collaborator) }
  let(:admin) { users(:admin) }
  let(:comment_author) { users(:no_collaborators) }
  let(:event) { events(:note_on_no_collaborators_private)}
  let(:comment) { comments(:comment_on_note_on_no_collaborators_private) }
  #let(:comment_on_note_on_public_workfile) { comments(:comment_on_note_on_public_workfile) }
  let(:event_note_on_public_workfile) { events(:note_on_public_workfile) }
  let(:comment_access) {
    controller = CommentsController.new
    stub(controller).current_user { user }
    CommentAccess.new(controller)
  }

  describe "#show?" do
    context "without access to event" do
      let(:user) { user_without_access }

      it "does not allow" do
        comment_access.can?(:show, comment).should be_false
      end
    end

    context "with access to event" do
      let(:user) { user_with_access }

      it "allows" do
        comment_access.can?(:show, comment).should be_true
      end
    end

    context "with admin" do
      let(:user) { admin }

      it "allows" do
        comment_access.can?(:show, comment).should be_true
      end
    end
  end

  describe "#create?" do
    context "without access to event" do
      let(:user) { user_without_access }

      it "does not allow" do
        comment_access.can?(:create_comment_on, Comment, event).should be_false
      end
    end

    context "with access to event" do
      let(:user) { user_with_access }

      it "allows" do
        comment_access.can?(:create_comment_on, Comment, event).should be_true
      end
    end

    context "with admin" do
      let(:user) { admin }

      it "allows" do
        comment_access.can?(:create_comment_on, Comment, event).should be_true
      end
    end

    context "on Public workspace" do
      let(:user) { users(:no_collaborators) }

      it "allows" do
        comment_access.can?(:create_comment_on, Comment, event_note_on_public_workfile).should be_true
      end
    end
  end


  describe "#destroy?" do
    context "without access to comment" do
      let(:user) { user_without_access }

      it "does not allow" do
        comment_access.can?(:destroy, comment).should be_false
      end
    end

    context "with read access to comment" do
      let(:user) { user_with_access }

      it "allows" do
        comment_access.can?(:destroy, comment).should be_false
      end
    end

    context "as comment author" do
      let(:user) { comment_author }

      it "allows" do
        comment_access.can?(:destroy, comment).should be_true
      end
    end

    context "with admin" do
      let(:user) { admin }

      it "allows" do
        comment_access.can?(:destroy, comment).should be_true
      end
    end
  end
end
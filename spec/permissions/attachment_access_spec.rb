require "spec_helper"

describe AttachmentAccess do
  let(:fake_controller) { ApplicationController.new }
  let(:access) { AttachmentAccess.new(fake_controller) }
  let(:note) { Events::NoteOnGreenplumInstance.first }


  describe "#create?(params)" do
    before do
    end

    context "when current user is same as actor of note" do
      it " returns true" do
        stub(fake_controller).current_user { note.actor }
        access.create?(Attachment, note).should == true
      end
    end

    context "when current user is not same as actor of note" do
      it " returns false" do
        stub(fake_controller).current_user { users(:the_collaborator) }
        access.create?(Attachment, note).should == false
      end
    end
  end


end

require "spec_helper"

describe NoteAttachmentAccess do
  let(:fake_controller) { ApplicationController.new }
  let(:access) { NoteAttachmentAccess.new(fake_controller) }
  let(:note) { Events::NOTE_ON_GREENPLUM_INSTANCE.first }


  describe "#create?(params)" do
    before do
    end

    context "when current user is same as actor of note" do
      it " returns true" do
        stub(fake_controller).current_user { note.actor }
        access.create?(note).should == true
      end
    end

    context "when current user is not same as actor of note" do
      it " returns false" do
        stub(fake_controller).current_user { users(:carly) }
        access.create?(note).should == false
      end
    end
  end


end

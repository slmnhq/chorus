require 'spec_helper'

describe InsightsController do
  describe "POST create" do
    let(:note) { Events::NoteOnGreenplumInstance.first }
    let(:user) { note.actor }

    before do
      log_in user
    end

    subject { post :create, :insight => {:note_id => note.id} }

    it "marks the NOTE as an insight" do
      subject
      response.code.should == "201"
      note.reload.should be_insight
      note.promoted_by.should == user
    end

    context "Note on Workspace" do
      let(:note) { Events::NoteOnWorkspace.first }

      it "should not be promotable" do
        subject
        response.code.should == "422"
      end
    end

    context "Permissions to promote" do
      let(:note) { events(:note_on_no_collaborators_private_workfile) }
      let(:user) { users(:not_a_member) }

      it "should fail" do
        subject
        response.code.should == "401"
      end
    end
  end
end

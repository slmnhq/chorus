require "spec_helper"

describe Events::NoteAccess do
  let(:fake_controller) { Object.new }
  let(:access) { Events::NoteAccess.new(fake_controller) }
  let(:note) { Events::NOTE_ON_GREENPLUM_INSTANCE.first }

  describe "#destroy" do
    context " when the current user is the note's actor" do
      it "returns true" do
        stub(fake_controller).current_user { note.actor }
        access.destroy?(note).should be_true
      end
    end

    context "when the current user is an admin" do
      it "returns true" do
        admin = users(:admin)
        stub(fake_controller).current_user { admin }
        access.destroy?(note).should be_true
      end
    end

    context "when the note is on a workspace and the current user is the workspace owner" do
      let(:note) do
        Events::NOTE_ON_WORKSPACE.by(users(:alice)).create(
          :workspace => workspaces(:bob_public),
          :body => "hi"
        )
      end

      it "returns true" do
        stub(fake_controller).current_user { note.workspace.owner }
        access.destroy?(note).should be_true
      end
    end

    it "returns false otherwise" do
      other_user = FactoryGirl.build(:user)
      stub(fake_controller).current_user { other_user }
      access.destroy?(note).should be_false
    end
  end

  describe "classes for individual note types" do
    it "has a class for each type of note" do
      Events::NOTE_ON_WORKSPACEAccess.new(fake_controller).should be_a Events::NoteAccess
      Events::NOTE_ON_GREENPLUM_INSTANCEAccess.new(fake_controller).should be_a Events::NoteAccess
      Events::NOTE_ON_HADOOP_INSTANCEAccess.new(fake_controller).should be_a Events::NoteAccess
    end
  end
end

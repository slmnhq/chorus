require "spec_helper"

  describe Comment do
    context "On a note" do
      let(:note) { events(:note_on_bob_public_workfile) }

      it { should validate_presence_of :author_id }
      it { should validate_presence_of :text }
      it { should validate_presence_of :event_id }
    end
  end
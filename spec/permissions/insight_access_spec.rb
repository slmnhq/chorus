require "spec_helper"

describe InsightAccess do
  let(:fake_controller) { ApplicationController.new }
  let(:access) { InsightAccess.new(fake_controller) }
  let(:note) { events(:insight_on_greenplum) }

  describe "#update?" do
    context " when the current user is the note's actor" do
      it "returns true" do
        stub(fake_controller).current_user { users(:owner) }
        access.update?(note).should be_true
      end
    end

    context "when the current user is an admin" do
      it "returns true" do
        admin = users(:admin)
        stub(fake_controller).current_user { admin }
        access.update?(note).should be_true
      end
    end

    it "returns false otherwise" do
      other_user = FactoryGirl.build(:user)
      stub(fake_controller).current_user { other_user }
      access.update?(note).should be_false
    end
  end

end

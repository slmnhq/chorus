require "spec_helper"

describe DefaultAccess do
  let(:access) do
    context = Object.new
    stub(context).current_user { user }
    DefaultAccess.new(context)
  end

  describe "can?" do
    context "when the current user is an admin" do
      let(:user) { FactoryGirl.build(:admin) }

      it "always returns true" do
        dont_allow(access).do_something?
        access.can?(:do_something).should be_true
      end
    end

    context "when the current user is not an admin" do
      let(:user) { FactoryGirl.build(:user) }

      it "calls the given authorization method" do
        mock(access).do_something? { false }
        access.can?(:do_something).should be_false
      end
    end
  end
end

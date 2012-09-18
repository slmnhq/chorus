require "spec_helper"

describe AdminFullAccess do
  let(:user) { users(:no_collaborators) }
  let(:context) { ApplicationController.new }
  let(:access) do
    stub(context).current_user { user }
    AdminFullAccess.new(context)
  end

  describe "can?" do
    context "when the current user is an admin" do
      let(:user) { users(:admin) }

      it "always returns true" do
        dont_allow(access).do_something?
        access.can?(:do_something).should be_true
      end
    end

    context "when the current user is not an admin" do
      it "calls the given authorization method" do
        mock(access).do_something? { false }
        access.can?(:do_something).should be_false
      end
    end
  end
end

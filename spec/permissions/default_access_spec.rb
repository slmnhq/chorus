require "spec_helper"

describe DefaultAccess do
  let(:user) { FactoryGirl.build(:user) }
  let(:context) { ApplicationController.new }
  let(:access) do
    stub(context).current_user { user }
    DefaultAccess.new(context)
  end

  describe "create_note_on?" do
    it "always returns true (this method should be overridden for particular model classes)" do
      access.create_note_on?(user).should be_true
    end
  end

  describe "#access_for(model)" do
    context "when there is an access class for the given model" do
      it "returns an access class for that model" do
        workspace = workspaces(:public)
        other_access = access.access_for(workspace)
        other_access.should be_a(WorkspaceAccess)
        other_access.context.should == context
      end
    end

    context "when there is no access class for the given model" do
      it "returns a default access class" do
        user = users(:owner)
        other_access = access.access_for(user)
        other_access.should be_a(DefaultAccess)
        other_access.context.should == context
      end
    end
  end
end

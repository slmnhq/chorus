require "spec_helper"
describe DefaultAccess do
  context "user is logged in" do
    let(:default_access) { DefaultAccess.new FactoryGirl.create(:user) }

    it "should be allowed" do
      default_access.logged_in?.should be true
    end
  end

  context "user is not logged in" do
    let(:default_access) { DefaultAccess.new nil }

    it "should not be allowed" do
      default_access.logged_in?.should be false
    end
  end
end

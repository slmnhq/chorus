require "spec_helper"
describe Instance do
  before do
    @instance = FactoryGirl.create :instance
  end

  describe "validations" do
    it { should validate_presence_of :name }
    it { should validate_presence_of :host }
    it { should validate_presence_of :port }
    it { should validate_presence_of :maintenance_db }
  end

  describe "associations" do
    it { should belong_to :owner }
    it { should have_many :accounts }
  end

  it "should not allow changing inaccessible attributes" do
    instance = FactoryGirl.create(:instance)
    changed_id = 122222
    instance.attributes = {:id => changed_id, :owner_id => changed_id}
    instance.id.should_not == 12222
    instance.owner_id.should_not == 12222
  end

  describe "#owner_account" do
    it "returns the instance owner's account" do
      owner = FactoryGirl.create(:user)
      instance = FactoryGirl.create(:instance, :owner => owner)
      owner_account = FactoryGirl.create(:instance_account, :instance => instance, :owner => owner)

      instance.owner_account.should == owner_account
    end
  end

  describe "#for_user" do
    before(:each) do
      @user = FactoryGirl.create :user
      @instance_allowed1 = FactoryGirl.create :instance, :owner => @user
      @instance_allowed2 = FactoryGirl.create :instance, :owner => @user
      @instance_forbidden = FactoryGirl.create :instance
      @instance_shared = FactoryGirl.create :instance, :shared => true
    end

    context("user as non-admin") do
      it "returns all the instances the user has access to" do
        Instance.for_user(@user).should include @instance_allowed1
        Instance.for_user(@user).should include @instance_allowed2
        Instance.for_user(@user).should include @instance_shared
      end

      it "does not return instances the user has no access to" do
        Instance.for_user(@user).should_not include(@instance_forbidden)
      end
    end

    context("user as admin") do
      before(:each) do
        @user.admin = true
      end

      it "returns all the instances the user has access to" do
        Instance.for_user(@user).should include @instance_allowed1
        Instance.for_user(@user).should include @instance_allowed2
        Instance.for_user(@user).should include @instance_forbidden
        Instance.for_user(@user).should include @instance_shared
      end
    end
  end
end
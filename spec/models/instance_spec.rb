require "spec_helper"

describe Instance do
  describe "validations" do
    it { should validate_presence_of :name }
    it { should validate_presence_of :host }
    it { should validate_presence_of :port }
    it { should validate_presence_of :maintenance_db }
  end

  describe "associations" do
    it { should belong_to :owner }
    it { should have_many :accounts }
    it { should have_many :databases }
  end

  it "should not allow changing inaccessible attributes" do
    instance = FactoryGirl.create :instance
    changed_id = 122222
    instance.attributes = {:id => changed_id, :owner_id => changed_id}
    instance.id.should_not == changed_id
    instance.owner_id.should_not == changed_id
  end

  describe "#owner_account" do
    it "returns the instance owner's account" do
      owner = FactoryGirl.create(:user)
      instance = FactoryGirl.create(:instance, :owner => owner)
      owner_account = FactoryGirl.create(:instance_account, :instance => instance, :owner => owner)

      instance.owner_account.should == owner_account
    end
  end

  describe ".accessible_to" do
    before(:each) do
      @user = FactoryGirl.create :user
      @instance_owned = FactoryGirl.create :instance, :owner => @user
      @instance_shared = FactoryGirl.create :instance, :shared => true
      @instance_with_membership = FactoryGirl.create(:instance_account, :owner => @user).instance
      @instance_forbidden = FactoryGirl.create :instance
    end

    it "returns owned instances" do
      Instance.accessible_to(@user).should include @instance_owned
    end

    it "returns shared instances" do
      Instance.accessible_to(@user).should include @instance_shared
    end

    it "returns instances to which user has membership" do
      Instance.accessible_to(@user).should include @instance_with_membership
    end

    it "does not return instances the user has no access to" do
      Instance.accessible_to(@user).should_not include(@instance_forbidden)
    end
  end

  describe ".owned_by" do
    let(:owner) { FactoryGirl.create(:user) }
    let!(:shared_instance) { FactoryGirl.create(:instance, :shared => true) }
    let!(:owned_instance) { FactoryGirl.create(:instance, :owner => owner) }
    let!(:other_instance) { FactoryGirl.create(:instance) }

    context "for owners" do
      it "includes owned instances" do
        Instance.owned_by(owner).should include owned_instance
      end

      it "excludes other users' instances" do
        Instance.owned_by(owner).should_not include other_instance
      end

      it "excludes shared instances" do
        Instance.owned_by(owner).should_not include shared_instance
      end
    end

    context "for non-owners" do
      it "excludes all instances" do
        Instance.owned_by(FactoryGirl.create(:user)).should be_empty
      end
    end

    context "for admins" do
      it "includes all instances" do
        Instance.owned_by(FactoryGirl.create(:admin)).should =~ [shared_instance, owned_instance, other_instance]
      end
    end
  end

  describe ".unshared" do
    it "returns unshared instances" do
      unshared_instance = FactoryGirl.create(:instance, :shared => false)
      another_unshared_instance = FactoryGirl.create(:instance, :shared => nil)
      Instance.unshared.should =~ [unshared_instance, another_unshared_instance]
    end

    it "does not return shared instances" do
      FactoryGirl.create(:instance, :shared => true)
      Instance.unshared.should == []
    end
  end

  describe "#account_for_user!" do
    let(:user) { FactoryGirl.create :user }

    context "shared instance" do
      let!(:instance) { FactoryGirl.create :instance, :shared => true }
      let!(:owner_account) { FactoryGirl.create :instance_account, :instance => instance, :owner_id => instance.owner.id }

      it "should return the same account for everyone" do
        instance.account_for_user!(user).should == owner_account
        instance.account_for_user!(instance.owner).should == owner_account
      end
    end

    context "individual instance" do
      let!(:instance) { FactoryGirl.create :instance, :shared => false }
      let!(:owner_account) { FactoryGirl.create :instance_account, :instance => instance, :owner_id => instance.owner.id }
      let!(:user_account) { FactoryGirl.create :instance_account, :instance => instance, :owner_id => user.id }
      let!(:admin) { FactoryGirl.create :admin }

      it "should return the account for the user or nil if the user has no account" do
        instance.account_for_user!(instance.owner).should == owner_account
        instance.account_for_user!(user).should == user_account
      end

      it "should return the owner's account if current user is admin" do
        instance.account_for_user!(admin).should == owner_account
      end
    end

    context "missing account" do
      let!(:instance) { FactoryGirl.create :instance }

      it "raises an exception" do
        expect { instance.account_for_user!(user) }.to raise_error(ActiveRecord::RecordNotFound)
      end
    end
  end

  describe "#account_for_user" do
    let(:user) { FactoryGirl.create :user }

    context "missing account" do
      let!(:instance) { FactoryGirl.create :instance }

      it "returns nil" do
        instance.account_for_user(user).should be_nil
      end
    end
  end
end

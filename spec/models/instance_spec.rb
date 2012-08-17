require "spec_helper"

describe Instance do
  describe "validations" do
    it { should validate_presence_of :name }
    it { should validate_presence_of :host }
    it { should validate_presence_of :port }
    it { should validate_presence_of :maintenance_db }

    describe "name" do
      context "when instance name is invalid format" do
        it "fails validation when not a valid format" do
          FactoryGirl.build(:instance, :name => "1aaa1").should_not be_valid
        end

        it "fails validation due to field length" do
          FactoryGirl.build(:instance, :name => 'a'*45).should_not be_valid
        end
      end

      context "when instance name is valid" do
        it "validates" do
          FactoryGirl.build(:instance, :name => "aaa1").should be_valid
        end
      end
    end

    describe "port" do
      context "when port is not a number " do
        it "fails validation" do
          FactoryGirl.build(:instance, :port => "1aaa1").should_not be_valid
        end
      end

      context "when port is number" do
        it "validates" do
          FactoryGirl.build(:instance, :port => "1111").should be_valid
        end
      end
    end
  end

  describe "associations" do
    it { should belong_to :owner }
    it { should have_many :accounts }
    it { should have_many :databases }
    it { should have_many :activities }
    it { should have_many :events }
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
        Instance.owned_by(users(:evil_admin)).count.should == Instance.count
      end
    end
  end

  describe ".unshared" do
    it "returns unshared instances" do
      instances = Instance.unshared
      instances.length.should > 0
      instances.each { |i| i.should_not be_shared }
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
      let!(:instance) { instances(:bobs_instance) }
      let!(:owner_account) { InstanceAccount.find_by_instance_id_and_owner_id(instance.id, instance.owner.id) }
      let!(:user_account) { InstanceAccount.find_by_instance_id_and_owner_id(instance.id, users(:carly).id) }

      it "should return the account for the user" do
        instance.account_for_user!(instance.owner).should == owner_account
        instance.account_for_user!(user_account.owner).should == user_account
      end
    end

    context "missing account" do
      let!(:instance) { instances(:bobs_instance) }

      it "raises an exception" do
        expect { instance.account_for_user!(users(:alice)) }.to raise_error(ActiveRecord::RecordNotFound)
      end
    end
  end

  describe "#account_for_user" do
    let!(:instance) { instances(:bobs_instance) }

    context "missing account" do
      it "returns nil" do
        instance.account_for_user(users(:alice)).should be_nil
      end
    end
  end

  describe "search fields" do
    it "indexes text fields" do
      Instance.should have_searchable_field :name
      Instance.should have_searchable_field :description
    end
  end

  describe "refresh_databases", :database_integration => true do
    context "with database integration", :database_integration => true do
      let(:instance) { account_with_access.instance }
      let(:database) { instance.databases.find_by_name(GpdbIntegration.database_name) }
      let(:account_with_access) { GpdbIntegration.real_gpdb_account }
      before do
        refresh_chorus
      end

      it "adds new database_instance_accounts" do
        database.instance_accounts.find_by_id(account_with_access.id).should be_nil
        instance.refresh_databases
        database.instance_accounts.find_by_id(account_with_access.id).should == account_with_access
      end
    end

    context "with database stubbed" do
      let(:instance) { instances(:bobs_instance) }
      let(:database) { gpdb_databases(:bobs_database) }
      let(:missing_database) { instance.databases.where("id <> #{database.id}").first }
      let(:account_with_access) { instance.owner_account }
      let(:account_without_access) { instance_accounts(:iamcarly) }

      before do
        stub_gpdb(instance.owner_account, instance.send(:database_and_role_sql) => [
            {'database_name' => database.name, 'db_username' => account_with_access.db_username},
            {'database_name' => 'something_new', 'db_username' => account_with_access.db_username}
        ])
      end

      it "creates new databases" do
        instance.refresh_databases
        instance.databases.where(:name => 'something_new').should exist
      end

      it "removes database_instance_accounts if they no longer exist" do
        database.instance_accounts << account_without_access
        instance.refresh_databases
        database.instance_accounts.find_by_id(account_without_access.id).should be_nil
      end

      it "marks databases as stale if they no longer exist" do
        missing_database.should_not be_stale
        instance.refresh_databases(:mark_stale => true)
        missing_database.reload.should be_stale
        missing_database.stale_at.should be_within(5.seconds).of(Time.now)
      end

      it "does not mark databases as stalle if flag not set" do
        missing_database.should_not be_stale
        instance.refresh_databases
        missing_database.reload.should_not be_stale
      end

      it "clears the stale flag on databases if they are found again" do
        database.update_attributes!({:stale_at => Time.now}, :without_protection => true)
        instance.refresh_databases
        database.reload.should_not be_stale
      end

      it "does not update the stale_at time" do
        missing_database.update_attributes!({:stale_at => 1.year.ago}, :without_protection => true)
        instance.refresh_databases(:mark_stale => true)
        missing_database.reload.stale_at.should be_within(5.seconds).of(1.year.ago)
      end
    end
  end

  describe "#databases", :database_integration => true do
    let(:account) { GpdbIntegration.real_gpdb_account }

    subject { account.instance }

    it "should not include the 'template0' database" do
      subject.databases.map(&:name).tap { |x| puts x }.should_not include "template0"
    end
  end
end


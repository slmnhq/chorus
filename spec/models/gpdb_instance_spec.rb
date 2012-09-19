require "spec_helper"

describe GpdbInstance do
  describe "validations" do
    it { should validate_presence_of :name }
    it { should validate_presence_of :maintenance_db }

    describe "name" do
      context "when gpdb instance name is invalid format" do
        it "fails validation when not a valid format" do
          FactoryGirl.build(:gpdb_instance, :name => "1aaa1").should_not be_valid
        end

        it "fails validation due to field length" do
          FactoryGirl.build(:gpdb_instance, :name => 'a'*45).should_not be_valid
        end
      end

      context "when gpdb instance name is valid" do
        it "validates" do
          FactoryGirl.build(:gpdb_instance, :name => "aaa1").should be_valid
        end
      end
    end

    describe "port" do
      context "when port is not a number" do
        it "fails validation" do
          FactoryGirl.build(:gpdb_instance, :port => "1aaa1").should_not be_valid
        end
      end

      context "when port is number" do
        it "validates" do
          FactoryGirl.build(:gpdb_instance, :port => "1111").should be_valid
        end
      end

      context "when host is set but not port" do
        it "fails validation" do
          FactoryGirl.build(:gpdb_instance, :host => "1111", :port => "").should_not be_valid
        end
      end

      context "when host and port both are not set" do
        it "NO validate" do
          FactoryGirl.build(:gpdb_instance, :host => "", :port => "").should be_valid
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
    gpdb_instance = FactoryGirl.create :gpdb_instance
    changed_id = 122222
    gpdb_instance.attributes = {:id => changed_id, :owner_id => changed_id}
    gpdb_instance.id.should_not == changed_id
    gpdb_instance.owner_id.should_not == changed_id
  end

  describe "#create_database" do
    context "using a real remote greenplum instance", :database_integration => true do
      let(:account) { GpdbIntegration.real_gpdb_account }
      let(:gpdb_instance) { GpdbIntegration.real_gpdb_instance }

      after do
        exec_on_gpdb('DROP DATABASE IF EXISTS "new_database"')
      end

      it "creates the database" do
        expect do
          gpdb_instance.create_database("new_database", account.owner).tap do |database|
            database.name.should == "new_database"
            database.gpdb_instance.should == gpdb_instance
          end
        end.to change(GpdbDatabase, :count).by(1)
        exec_on_gpdb("select datname from pg_database where datname = 'new_database';").should_not be_empty
      end

      it "raises an error if a database with the same name already exists" do
        expect {
          gpdb_instance.create_database(gpdb_instance.databases.last.name, account.owner)
        }.to raise_error(ActiveRecord::StatementInvalid) {|error|
          error.message.should match "already exists"
        }
      end

      def exec_on_gpdb(sql)
        Gpdb::ConnectionBuilder.connect!(gpdb_instance, account) do |connection|
          connection.exec_query(sql)
        end
      end
    end

    context "when gpdb connection is broken" do
      let(:gpdb_instance) { gpdb_instances(:bobs_instance) }
      let(:user) { users(:owner) }

      before do
        mock(Gpdb::ConnectionBuilder).connect!.with_any_args { raise ActiveRecord::JDBCError.new('quack') }
      end

      it "raises an error" do
        expect {
          gpdb_instance.create_database("bobs_database_new", user)
        }.to raise_error(ActiveRecord::JDBCError) { |error|
          error.message.should match "quack"
        }
      end

      it "does not create a database entry" do
        expect {
          gpdb_instance.create_database("bobs_database_new", user)
        }.to raise_error(ActiveRecord::JDBCError)
        gpdb_instance.databases.find_by_name("bobs_database_new").should be_nil
      end
    end
  end

  describe "#owner_account" do
    it "returns the gpdb instance owner's account" do
      owner = FactoryGirl.create(:user)
      gpdb_instance = FactoryGirl.create(:gpdb_instance, :owner => owner)
      owner_account = FactoryGirl.create(:instance_account, :gpdb_instance => gpdb_instance, :owner => owner)

      gpdb_instance.owner_account.should == owner_account
    end
  end

  describe "access control" do
    before(:each) do
      @user = FactoryGirl.create :user
      @gpdb_instance_owned = FactoryGirl.create :gpdb_instance, :owner => @user
      @gpdb_instance_shared = FactoryGirl.create :gpdb_instance, :shared => true
      @gpdb_instance_with_membership = FactoryGirl.create(:instance_account, :owner => @user).gpdb_instance
      @gpdb_instance_forbidden = FactoryGirl.create :gpdb_instance
    end

    describe '.accessible_to' do
      it "returns owned gpdb instances" do
        GpdbInstance.accessible_to(@user).should include @gpdb_instance_owned
      end

      it "returns shared gpdb instances" do
        GpdbInstance.accessible_to(@user).should include @gpdb_instance_shared
      end

      it "returns gpdb instances to which user has membership" do
        GpdbInstance.accessible_to(@user).should include @gpdb_instance_with_membership
      end

      it "does not return instances the user has no access to" do
        GpdbInstance.accessible_to(@user).should_not include(@gpdb_instance_forbidden)
      end
    end

    describe '#accessible_to' do
      it 'returns true if the instance is shared' do
        @gpdb_instance_shared.accessible_to(@user).should be_true
      end

      it 'returns true if the instance is owned by the user' do
        @gpdb_instance_owned.accessible_to(@user).should be_true
      end

      it 'returns true if the user has an instance account' do
        @gpdb_instance_with_membership.accessible_to(@user).should be_true
      end

      it 'returns false otherwise' do
        @gpdb_instance_forbidden.accessible_to(@user).should be_false
      end

    end
  end

  describe ".owned_by" do
    let(:owner) { FactoryGirl.create(:user) }
    let!(:gpdb_shared_instance) { FactoryGirl.create(:gpdb_instance, :shared => true) }
    let!(:gpdb_owned_instance) { FactoryGirl.create(:gpdb_instance, :owner => owner) }
    let!(:gpdb_other_instance) { FactoryGirl.create(:gpdb_instance) }

    context "for owners" do
      it "includes owned gpdb instances" do
        GpdbInstance.owned_by(owner).should include gpdb_owned_instance
      end

      it "excludes other users' gpdb instances" do
        GpdbInstance.owned_by(owner).should_not include gpdb_other_instance
      end

      it "excludes shared gpdb instances" do
        GpdbInstance.owned_by(owner).should_not include gpdb_shared_instance
      end
    end

    context "for non-owners" do
      it "excludes all gpdb instances" do
        GpdbInstance.owned_by(FactoryGirl.create(:user)).should be_empty
      end
    end

    context "for admins" do
      it "includes all gpdb instances" do
        GpdbInstance.owned_by(users(:evil_admin)).count.should == GpdbInstance.count
      end
    end
  end

  describe ".unshared" do
    it "returns unshared gpdb instances" do
      gpdb_instances = GpdbInstance.unshared
      gpdb_instances.length.should > 0
      gpdb_instances.each { |i| i.should_not be_shared }
    end
  end

  describe "#account_for_user!" do
    let(:user) { FactoryGirl.create :user }

    context "shared gpdb instance" do
      let!(:gpdb_instance) { FactoryGirl.create :gpdb_instance, :shared => true }
      let!(:owner_account) { FactoryGirl.create :instance_account, :gpdb_instance => gpdb_instance, :owner_id => gpdb_instance.owner.id }

      it "should return the same account for everyone" do
        gpdb_instance.account_for_user!(user).should == owner_account
        gpdb_instance.account_for_user!(gpdb_instance.owner).should == owner_account
      end
    end

    context "individual gpdb instance" do
      let!(:gpdb_instance) { gpdb_instances(:bobs_instance) }
      let!(:owner_account) { InstanceAccount.find_by_gpdb_instance_id_and_owner_id(gpdb_instance.id, gpdb_instance.owner.id) }
      let!(:user_account) { InstanceAccount.find_by_gpdb_instance_id_and_owner_id(gpdb_instance.id, users(:the_collaborator).id) }

      it "should return the account for the user" do
        gpdb_instance.account_for_user!(gpdb_instance.owner).should == owner_account
        gpdb_instance.account_for_user!(user_account.owner).should == user_account
      end
    end

    context "missing account" do
      let!(:gpdb_instance) { gpdb_instances(:bobs_instance) }

      it "raises an exception" do
        expect { gpdb_instance.account_for_user!(users(:no_collaborators)) }.to raise_error(ActiveRecord::RecordNotFound)
      end
    end
  end

  describe "#account_for_user" do
    let!(:gpdb_instance) { gpdb_instances(:bobs_instance) }

    context "missing account" do
      it "returns nil" do
        gpdb_instance.account_for_user(users(:no_collaborators)).should be_nil
      end
    end
  end

  describe "search fields" do
    it "indexes text fields" do
      GpdbInstance.should have_searchable_field :name
      GpdbInstance.should have_searchable_field :description
    end
  end

  describe "refresh_databases", :database_integration => true do
    context "with database integration", :database_integration => true do
      let(:gpdb_instance) { account_with_access.gpdb_instance }
      let(:database) { gpdb_instance.databases.find_by_name(GpdbIntegration.database_name) }
      let(:account_with_access) { GpdbIntegration.real_gpdb_account }

      it "adds new database_instance_accounts and enqueues a GpdbDatabase.reindexDatasetPermissions" do
        mock(QC.default_queue).enqueue("GpdbDatabase.reindexDatasetPermissions", database.id)
        database.instance_accounts = []
        database.instance_accounts.find_by_id(account_with_access.id).should be_nil
        gpdb_instance.refresh_databases
        database.instance_accounts.find_by_id(account_with_access.id).should == account_with_access
      end

      it "does not enqueue GpdbDatabase.reindexDatasetPermissions if the instance accounts for a database have not changed" do
        dont_allow(QC.default_queue).enqueue("GpdbDatabase.reindexDatasetPermissions", anything)
        gpdb_instance.refresh_databases
      end
    end

    context "with database stubbed" do
      let(:gpdb_instance) { gpdb_instances(:bobs_instance) }
      let(:database) { gpdb_databases(:bobs_database) }
      let(:missing_database) { gpdb_instance.databases.where("id <> #{database.id}").first }
      let(:account_with_access) { gpdb_instance.owner_account }
      let(:account_without_access) { instance_accounts(:not_bob) }

      before do
        stub_gpdb(gpdb_instance.owner_account, gpdb_instance.send(:database_and_role_sql) => [
            {'database_name' => database.name, 'db_username' => account_with_access.db_username},
            {'database_name' => 'something_new', 'db_username' => account_with_access.db_username}
        ])
      end

      it "creates new databases" do
        gpdb_instance.refresh_databases
        gpdb_instance.databases.where(:name => 'something_new').should exist
      end

      it "removes database_instance_accounts if they no longer exist" do
        database.instance_accounts << account_without_access
        gpdb_instance.refresh_databases
        database.instance_accounts.find_by_id(account_without_access.id).should be_nil
      end

      it "marks databases as stale if they no longer exist" do
        missing_database.should_not be_stale
        gpdb_instance.refresh_databases(:mark_stale => true)
        missing_database.reload.should be_stale
        missing_database.stale_at.should be_within(5.seconds).of(Time.now)
      end

      it "does not mark databases as stale if flag not set" do
        missing_database.should_not be_stale
        gpdb_instance.refresh_databases
        missing_database.reload.should_not be_stale
      end

      it "clears the stale flag on databases if they are found again" do
        database.update_attributes!({:stale_at => Time.now}, :without_protection => true)
        gpdb_instance.refresh_databases
        database.reload.should_not be_stale
      end

      it "does not update the stale_at time" do
        missing_database.update_attributes!({:stale_at => 1.year.ago}, :without_protection => true)
        gpdb_instance.refresh_databases(:mark_stale => true)
        missing_database.reload.stale_at.should be_within(5.seconds).of(1.year.ago)
      end

      context "when the instance is not available" do
        before do
          stub(Gpdb::ConnectionBuilder).connect! { raise ActiveRecord::JDBCError.new("Broken!") }
        end

        it "marks all the associated databases as stale if the flag is set" do
          gpdb_instance.refresh_databases(:mark_stale => true)
          database.reload.should be_stale
        end

        it "does not mark the associated databases as stale if the flag is not set" do
          gpdb_instance.refresh_databases
          database.reload.should_not be_stale
        end
      end
    end
  end

  describe "#databases", :database_integration => true do
    let(:account) { GpdbIntegration.real_gpdb_account }

    subject { account.gpdb_instance }

    it "should not include the 'template0' database" do
      subject.databases.map(&:name).should_not include "template0"
    end
  end
end


require 'spec_helper'

describe User do
  before do
    stub(LdapClient).enabled? { false }
  end

  describe ".authenticate" do
    let(:user) { users(:default) }

    it "returns true if the password is correct" do
      User.authenticate(user.username, 'password').should be_true
    end

    it "returns false if the password is incorrect" do
      User.authenticate(user.username, 'bogus').should be_false
    end

    it "returns false if the user is deleted" do
      user.destroy
      User.authenticate(user.username, 'password').should be_false
    end

    it "is case insensitive" do
      User.authenticate(user.username.downcase, 'password').should be_true
      User.authenticate(user.username.upcase, 'password').should be_true
    end

    context "when there's a legacy_password_digest" do
      before do
        @user = FactoryGirl.build :user
        @user.password_digest = "XXXXXXXXXXXINVALIDXXXXXXX"
        @user.password_salt = ""
        @user.legacy_password_digest = Digest::SHA1.hexdigest("secret")
        @user.save!
      end

      it "authenticates" do
        User.authenticate(@user.username, 'secret').should be_true
      end

      it "rehashes the password as sha256" do
        user = User.authenticate(@user.username, 'secret')
        user.password_digest.should == Digest::SHA256.hexdigest('secret' + user.password_salt)
      end

      it "deletes the legacy_password_digest" do
        user = User.authenticate(@user.username, 'secret')
        user.legacy_password_digest.should be_blank
      end
    end
  end

  describe ".order" do
    it "sorts by first name, by default" do
      User.order(nil).to_a.should == User.all(:order => "LOWER(first_name)").to_a
    end

    context "with a recognized sort order" do
      it "respects the sort order" do
        User.order("last_name").to_a.should == User.all(:order => "LOWER(last_name)").to_a
      end
    end

    context "with an unrecognized sort order" do
      it "sorts by first name" do
        User.order("last_name; DROP TABLE users;").to_a.should == User.order("LOWER(first_name)").to_a
      end
    end
  end

  describe "#accessible_events" do
    let(:owner) { users(:owner) }
    let(:instance_event) { events(:owner_creates_greenplum_instance) }
    let(:public_workspace_event) { events(:owner_creates_public_workspace) }
    let(:private_workspace_event) { events(:owner_creates_private_workspace) }
    let(:user_added_event) { events(:admin_creates_owner) }

    context "to members of a private workspace" do
      let(:current_user) { users(:the_collaborator) }

      it "returns all the events to a member of the private workspace" do
        owner.accessible_events(current_user).should include(instance_event, public_workspace_event, private_workspace_event, user_added_event)
      end
    end

    context "to non-members of a private workspace" do
      let(:current_user) { users(:no_collaborators) }

      it "returns all the public events to a non-member of the private workspace" do
        owner.accessible_events(current_user).should include(instance_event, public_workspace_event, user_added_event)
        owner.accessible_events(current_user).should_not include(private_workspace_event)
      end
    end
  end

  describe "validations" do
    before do
      @user = FactoryGirl.create :user #, :username => 'aDmin'
    end

    let(:max_user_icon_size) {Chorus::Application.config.chorus['file_sizes_mb']['user_icon']}

    it { should validate_presence_of :first_name }
    it { should validate_presence_of :last_name }
    it { should validate_presence_of :username }
    it { should validate_presence_of :email }
    it { should validate_attachment_size(:image).less_than(max_user_icon_size.megabytes) }

    describe "field length" do
      it { should ensure_length_of(:username).is_at_most(256) }
      it { should ensure_length_of(:first_name).is_at_most(256) }
      it { should ensure_length_of(:last_name).is_at_most(256) }
      it { should ensure_length_of(:email).is_at_most(256) }
      it { should ensure_length_of(:title).is_at_most(256) }
      it { should ensure_length_of(:dept).is_at_most(256) }
      it { should ensure_length_of(:password).is_at_least(6) }
      it { should ensure_length_of(:password).is_at_most(256) }
      it { should ensure_length_of(:notes).is_at_most(4096) }
    end

    describe "username" do
      context "when no other user with that username exists" do
        it "validates" do
          FactoryGirl.build(:user, :username => "foo").should be_valid
        end
      end

      context "when another non-deleted user with that username exists" do
        before(:each) do
          FactoryGirl.create(:user, :username => "foo")
        end

        it "fails validation" do
          FactoryGirl.build(:user, :username => "foo").should_not be_valid
        end
      end

      context "when a deleted user with that username exists" do
        before(:each) do
          FactoryGirl.build(:user, :username => "foo", :deleted_at => Time.now)
        end

        it "validates" do
          FactoryGirl.build(:user, :username => "foo").should be_valid
        end
      end

      it "fails with invalid username" do
        FactoryGirl.build(:user, :username => "My Name Is Michael Cane").should_not be_valid
      end

      it "allows a username of 256 characters" do
        expect { FactoryGirl.build(:user, :username => 'a' * 256).save! }.to change { User.count }.by(1)
      end
    end

    describe "password" do
      context "when ldap is enabled" do
        before do
          stub(LdapClient).enabled? { true }
        end

        it "is not required for any user" do
          user = FactoryGirl.build(:user, :password => nil, :password_digest => nil)
          user.should be_valid
        end
      end

      context "when legacy password exists" do
        it "is not required for any user" do
          user = FactoryGirl.build(:user, :password => nil, :legacy_password_digest => 'password-digest!')
          user.should be_valid
        end
      end

      context "when the password is not being modified" do
        it "is required if user does not have a saved password" do
          user = FactoryGirl.build(:user, :password_digest => nil, :password => nil)
          user.should validate_presence_of(:password)
        end

        it "is not required if user has a saved password" do
          user = FactoryGirl.build(:user, :password_digest => "1234", :password => nil)
          user.should be_valid
        end
      end

      context "when the password is being modified" do
        it { ensure_length_of(:password).is_at_least(6) }

        it "the password is updated" do
          @user = FactoryGirl.build :user, :username => 'jimmy'
          @user.save!

          @user.password = "654321"
          @user.save!
          User.named('jimmy').password_digest.should == Digest::SHA256.hexdigest("654321" + @user.password_salt)
        end
      end
    end

    describe "email" do
      it "should require a@b.c..." do
        @user.email = "abc"
        @user.should be_invalid
      end

      it "should accept + in the left-hand side of emails" do
        @user.email = "xyz+123@emc.com"
        @user.should be_valid
      end
    end

    describe "duplicate user names" do
      it "should be disallowed" do
        user2 = FactoryGirl.build(:user, :username => @user.username.upcase)
        user2.should_not be_valid
      end

      it "should be allowed when user name belongs to a deleted user" do
        @user.destroy
        user2 = FactoryGirl.build(:user, :username => @user.username)
        user2.should be_valid
      end
    end
  end

  describe "image" do
    it "is /image/default-user-icon.png by default" do
      user = FactoryGirl.build :user, :image => nil
      user.image.url.should == "/images/default-user-icon.png"
    end
  end

  describe "associations" do
    it { should have_many(:gpdb_instances) }
    it { should have_many(:instance_accounts) }
    it { should have_many(:hadoop_instances) }
    it { should have_many(:workspaces) }
    it { should have_many(:owned_workspaces) }
    it { should have_many(:activities) }
    it { should have_many(:events) }
  end

  describe ".admin_count" do
    it "returns the number of admins that exist" do
      User.admin_count.should == User.where(:admin => true).count
    end
  end

  describe "#admin=" do
    let(:admin) { users(:admin) }

    it "allows an admin to remove their own privileges, if there are other admins" do
      admin.admin = false
      admin.should_not be_admin
    end

    it "does not allow an admin to remove their own privileges if there are no other admins" do
      users(:evil_admin).delete
      admin.admin = false
      admin.should be_admin
    end
  end

  describe ".create" do
    it "should ignore fields that aren't in the model" do
      @user = User.create :bogus => 'field', :username => 'aDmin2', :password => 'secret', :first_name => "Jeau", :last_name => "Bleau", :email => "jb@emc.com"
      @user.should be_valid
      lambda { @user.bogus }.should raise_error
    end

    it "should create a random password salt on creation" do
      @user = User.create :bogus => 'field', :username => 'aDmin2', :password => 'secret', :first_name => "Jeau", :last_name => "Bleau", :email => "jb@emc.com"
      @user.password_salt.should_not be_empty
    end

    describe "when creating a second user with the same password" do
      it "has a different password digest" do
        @user = User.create :bogus => 'field', :username => 'aDmin2', :password => 'secret', :first_name => "Jeau", :last_name => "Bleau", :email => "jb@emc.com"
        @another_user = User.create :bogus => 'field', :username => 'hacker_guy', :password => 'secret', :first_name => "Jeau", :last_name => "Bleau", :email => "jb@emc.com"
        @another_user.password_digest.should_not equal(@user.password_digest)
      end
    end
  end

  describe "#destroy" do
    let(:user) { users(:default) }

    before do
      user.destroy
    end

    it "should not delete the database entry" do
      User.find_with_destroyed(user.id).should_not be_nil
    end

    it "should update the deleted_at field" do
      User.find_with_destroyed(user.id).deleted_at.should_not be_nil
    end

    it "should be hidden from subsequent #find calls" do
      User.find_by_id(user.id).should be_nil
    end

    it "should not allow deleting a user who owns a gpdb instance" do
      user.gpdb_instances << FactoryGirl.build(:gpdb_instance, :owner => user)
      begin
        user.destroy
        fail
      rescue ActiveRecord::RecordInvalid => e
        e.record.errors.messages[:user].should == [[:nonempty_instance_list, {}]]
      end
    end

    it "does not allow deleting a user who owns a workspace" do
      workspace_owner = users(:no_collaborators)
      begin
        workspace_owner.destroy
        fail
      rescue ActiveRecord::RecordInvalid => e
        e.record.errors.messages[:workspace_count].should == [[:equal_to, {:count => 0}]]
      end
    end
  end

  describe "search fields" do
    it "indexes text fields" do
      User.should have_searchable_field :first_name
      User.should have_searchable_field :last_name
      User.should have_searchable_field :username
      User.should have_searchable_field :email
    end
  end

  describe "#accessible_account_ids" do
    it "includes the users individual instance accounts plus all shared instance accounts" do
      user = users(:owner)
      shared_ids = InstanceAccount.joins(:gpdb_instance).where("gpdb_instances.shared = true").collect(&:id)
      user_ids = user.instance_account_ids
      user.accessible_account_ids.should =~ (shared_ids + user_ids).uniq
    end
  end

  it { should have_attached_file(:image) }
end

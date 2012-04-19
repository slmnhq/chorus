require 'spec_helper'

describe User do
  describe ".authenticate" do
    before do
      @user = FactoryGirl.create :user #, :username => 'aDmin'
    end

    it "returns true if the password is correct" do
      User.authenticate(@user.username, 'secret').should be_true
    end

    it "returns false if the password is incorrect" do
      User.authenticate(@user.username, 'bogus').should be_false
    end

    it "is case insensitive" do
      User.authenticate(@user.username.downcase, 'secret').should be_true
      User.authenticate(@user.username.upcase, 'secret').should be_true
    end
  end

  describe "validations" do
    before do
      @user = FactoryGirl.create :user #, :username => 'aDmin'
    end

    it { should validate_presence_of :first_name }
    it { should validate_presence_of :last_name }
    it { should validate_presence_of :username }
    it { should validate_presence_of :email }

    describe "password" do
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

    it "should disallow duplicate user names" do
      subject.should validate_uniqueness_of(:username).case_insensitive
    end

    describe "field length" do
      it { should ensure_length_of(:username).is_at_most(256) }
      it { should ensure_length_of(:first_name).is_at_most(256) }
      it { should ensure_length_of(:last_name).is_at_most(256) }
      it { should ensure_length_of(:email).is_at_most(256) }
      it { should ensure_length_of(:title).is_at_most(256) }
      it { should ensure_length_of(:dept).is_at_most(256) }
    end
  end

  describe "associations" do
    it { should have_many(:instances) }
  end

  describe ".admin_count" do
    it "returns the number of admins that exist" do
      FactoryGirl.create :admin
      User.admin_count.should == 1

      FactoryGirl.create :user
      User.admin_count.should == 1

      FactoryGirl.create :admin
      User.admin_count.should == 2
    end
  end

  describe "#admin=" do
    let(:admin) { FactoryGirl.create :admin }

    it "allows an admin to remove their own privileges, if there are other admins" do
      other_admin = FactoryGirl.create(:admin)
      admin.admin = false
      admin.should_not be_admin
    end

    it "does not allow an admin to remove their own privileges if there are no other admins" do
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
  end

  describe "#destroy" do
    let(:user) { FactoryGirl.create :user }

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
  end
end

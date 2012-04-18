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

    it "should ignore fields that aren't in the model" do
      @user = User.create :bogus => 'field', :username => 'aDmin2', :password => 'secret', :first_name => "Jeau", :last_name => "Bleau", :email => "jb@emc.com"
      @user.should be_valid
      lambda { @user.bogus }.should raise_error
    end

    describe "validations" do
      describe "required fields" do
        required_fields = [:first_name, :last_name, :username, :email]

        required_fields.each do |field|
          it "should require field: #{field}" do
            @user[field] = nil
            @user.should be_invalid
          end
        end
      end

      describe "password" do
        it "should be required" do
          lambda { FactoryGirl.create :user, :password => nil }.should raise_error
        end

        it "should be at least 6 characters for a new user" do
          lambda { FactoryGirl.create :user, :password => "12345" }.should raise_error
        end

        it "should be at least 6 characters for an existing user" do
          @user.password = "12345"
          @user.should be_invalid
        end
      end

      describe "email" do
        it "should require a@b.c..." do
          @user[:email] = "abc"
          @user.should be_invalid
        end

        it "should accept + in the left-hand side of emails" do
          @user[:email] = "xyz+123@emc.com"
          @user.should be_valid
        end
      end

      it "should disallow duplicate user names" do
        lambda{FactoryGirl.create :user, :username => @user.username}.should raise_error
        lambda{FactoryGirl.create :user, :username => @user.username.upcase}.should raise_error
        lambda{FactoryGirl.create :user, :username => @user.username.downcase}.should raise_error
      end

      describe "field length" do
        value = "x@x.x"
        257.times do
          value += "X"
        end

        [:username, :first_name, :last_name, :email, :title, :dept].each { |field|
          it "max 256 for: #{field}" do
            @user[field] = value
            @user.valid?.should be_false
          end
        }
      end
    end
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

    it "does not allow an admin to remove their own priveleges if there are no other admins" do
      admin.admin = false
      admin.should be_admin
    end
  end

  describe "#destroy" do
    let(:user) {FactoryGirl.create :user}

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

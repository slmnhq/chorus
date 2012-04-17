require 'active_model'
require_relative '../../app/services/credentials_validator'

class User
end

describe CredentialsValidator do
  describe ".user" do
    around do |example|
      original = I18n.load_path
      I18n.load_path = ['config/locales/en.yml']

      example.run

      I18n.load_path = original
    end

    it "returns the user" do
      user = stub
      User.stub(:authenticate).with('a_username', 'a_password').and_return { user }
      CredentialsValidator.user('a_username', 'a_password').should be(user)
    end

    it "raises an exception if the username is missing" do
      begin
        CredentialsValidator.user(nil, 'a_password')
        fail
      rescue CredentialsValidator::Invalid => e
        e.record.errors.get(:username).should == ["REQUIRED"]
      end
    end

    it "raises an exception if the password is missing" do
      begin
        CredentialsValidator.user('a_username', nil)
        fail
      rescue CredentialsValidator::Invalid => e
        e.record.errors.get(:password).should == ["REQUIRED"]
      end
    end

    it "raises an exception if the user cannot be authenticated" do
      begin
        User.stub(:authenticate).with('a_username', 'a_password').and_return { nil }
        CredentialsValidator.user('a_username', 'a_password')
        fail
      rescue CredentialsValidator::Invalid => e
        e.record.errors.get(:username_or_password).should == ["INVALID"]
      end
    end
  end
end

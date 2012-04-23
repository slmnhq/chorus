require 'spec_helper'

describe SessionsController do
  describe "#create" do
    describe "with the correct credentials" do
      let(:user) { User.new(:username => "admin") }

      before do
        CredentialsValidator.stub(:user).with('admin', 'secret').and_return { user }
        post :create, :username => 'admin', :password => 'secret'
      end

      it "succeeds" do
        response.code.should == "201"
      end

      it "includes the user info in the response" do
        decoded_response.should be_present
        decoded_response.username.should be_present
      end

      it "sets session expiration" do
        Chorus::Application.config.session_timeout = 4.hours
        Timecop.freeze(2012, 4, 17, 10, 30) do
          post :create, :username => 'admin', :password => 'secret'
          response.should be_success
          session[:expires_at].should == 4.hours.from_now
        end
      end
    end

    context "correct credentials for a deleted user" do
      let(:user) { FactoryGirl.create(:user, :username => "admin") }

      before do
        user.destroy
        post :create, :username => 'admin', :password => 'secret'
      end

      it "fails" do
        response.code.should == "401"
      end
    end

    describe "with incorrect credentials" do
      before do
        invalid_exception = CredentialsValidator::Invalid.new(stub(:errors => {:field => ["error"]}))
        CredentialsValidator.stub(:user).with('admin', 'public').and_raise(invalid_exception)
        post :create, :username => 'admin', :password => 'public'
      end

      it "fails" do
        response.code.should == "401"
      end

      it "includes details of invalid credentials" do
        decoded_errors.fields.field.should == ["error"]
      end
    end
  end

  describe "#destroy" do
    it "returns no content" do
      delete :destroy
      response.code.should == "204"
      response.body.strip.should be_empty
    end

    it "clears the session" do
      log_in FactoryGirl.create :user
      delete :destroy
      response.code.should == "204"
      session[:user_id].should_not be_present
      session[:expires_at].should_not be_present
    end
  end
end

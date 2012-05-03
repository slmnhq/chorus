require 'spec_helper'

describe SessionsController do
  describe "#create" do
    describe "with the correct credentials" do
      let(:user) { User.new(:username => "admin") }

      before do
        stub(CredentialsValidator).user('admin', 'secret') { user }
        post :create, :session => {:username => 'admin', :password => 'secret'}
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
          post :create, :session => {:username => 'admin', :password => 'secret'}
          response.should be_success
          session[:expires_at].should == 4.hours.from_now
        end
      end
    end

    context "correct credentials for a deleted user" do
      let(:user) { FactoryGirl.create(:user, :username => "admin") }

      before do
        user.destroy
        post :create, :session => {:username => 'admin', :password => 'secret'}
      end

      it "fails" do
        response.code.should == "401"
      end
    end

    describe "with incorrect credentials" do
      before do
        thing = Object.new
        stub(thing).errors { {:field => ["error"]} }
        invalid_exception = CredentialsValidator::Invalid.new(thing)
        stub(CredentialsValidator).user('admin', 'public') { raise(invalid_exception) }
        post :create, :session => {:username => 'admin', :password => 'public'}
      end

      it "fails" do
        response.code.should == "401"
      end

      it "includes details of invalid credentials" do
        decoded_errors.fields.field.should == ["error"]
      end
    end
  end

  describe "#show" do
    context "When logged in" do
      let(:user) { FactoryGirl.create :user }

      before do
        log_in user
        get :show
      end
      it "should return the current user" do
        response.code.should == "200"
      end
      it "should have the user attributes" do
        decoded_response.username.should == user.username
      end
    end

    context "when not logged in" do
      before do
        get :show
      end
      it "returns 401" do
        response.code.should == "401"
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

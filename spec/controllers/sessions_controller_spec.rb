require 'spec_helper'
require 'timecop'

describe SessionsController do
  describe "#create" do
    let(:user) { users(:admin) }
    let(:params) { {:username => user.username, :password => 'secret'} }

    describe "with the correct credentials" do

      before do
        stub(CredentialsValidator).user('admin', 'secret') { user }
        post :create, params
      end

      it "succeeds" do
        response.code.should == "201"
      end

      it "includes the user info in the response" do
        decoded_response.should be_present
        decoded_response.username.should be_present
      end

      it "sets session expiration" do
        stub(Chorus::Application.config.chorus).[]('session_timeout_minutes') { 123 }
        post :create, params
        response.should be_success
        session[:expires_at].should be_within(1.minute).of(123.minutes.from_now)
      end
    end

    context "with correct credentials for a deleted user" do
      let(:user) {users :evil_admin}
      before do
        user.destroy
        post :create, params
      end

      it "fails with response code 401" do
        response.code.should == "401"
      end
    end

    describe "with incorrect credentials" do
      before do
        thing = Object.new
        stub(thing).errors.stub!.messages { {:field => [["error", {}]]} }
        invalid_exception = CredentialsValidator::Invalid.new(thing)
        stub(CredentialsValidator).user(user.username, 'secret') { raise(invalid_exception) }
        post :create, params
      end

      it "fails with response code 401" do
        response.code.should == "401"
      end

      it "includes details of invalid credentials" do
        decoded_errors.fields.field.ERROR.should == {}
      end
    end
  end

  describe "#show" do
    context "When logged in" do
      let(:user) { users(:owner) }

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
      log_in users(:owner)
      delete :destroy
      response.code.should == "204"
      session[:user_id].should_not be_present
      session[:expires_at].should_not be_present
    end
  end
end

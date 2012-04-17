require 'spec_helper'

describe ApplicationController do
  class ApplicationController
    def action_requiring_session
      head :ok
    end
  end

  describe "#current_user" do
    before do
      @user = FactoryGirl.create(:user)
    end

    it "returns the user based on the session's user id" do
      session[:user_id] = @user.id
      controller.send(:current_user).should == @user
    end

    it "returns nil when there is no user_id stored in the session" do
      session[:user_id] = nil
      controller.send(:current_user).should be_nil
    end

    it "returns nil when there is no user with the id stored in the session" do
      session[:user_id] = -1
      controller.send(:current_user).should be_nil
    end
  end

  describe "session expiration" do
    before do
      log_in FactoryGirl.create :user
      session[:expires_at] = 1.hour.from_now
    end

    context "with and unexpired session" do
      it "allows API requests" do
        get :action_requiring_session
        response.should be_success
      end

      it "resets the expires_at" do
        get :action_requiring_session
        session[:expires_at].should > 1.hour.from_now
      end

      it "uses the configured session timeout" do
        Chorus::Application.config.session_timeout = 4.hours
        Timecop.freeze(2012, 4, 17, 10, 30) do
          get :action_requiring_session
          session[:expires_at].should == 4.hours.from_now
        end
      end
    end

    context "with an expired session" do
      before do
        session[:expires_at] = 2.hours.ago
      end

      it "returns 'unauthorized'" do
        get :action_requiring_session
        response.code.should == "401"
      end
    end

    context "without session expiration" do
      it "returns 'unauthorized'" do
        session.delete(:expires_at)
        get :action_requiring_session
        response.code.should == "401"
      end
    end
  end
end

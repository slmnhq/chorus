require 'spec_helper'

describe ApplicationController do
  class ApplicationController
    def any_action
    end

    def action_that_presents
      present object_to_present
    end

    def action_requiring_session
      head :ok
    end
  end

  describe "rescuing from errors" do
    before do
      log_in FactoryGirl.create :user
    end

    it "renders 'not found' JSON when record not found" do
      controller.stub(:any_action).and_raise(ActiveRecord::RecordNotFound)
      get :any_action

      response.code.should == "404"
      decoded_errors.record.should == "NOT_FOUND"
    end

    it "renders 'invalid' JSON when record is invalid" do
      invalid_record = User.new
      invalid_record.errors.add(:username, :blank)
      controller.stub(:any_action).and_raise(ActiveRecord::RecordInvalid.new(invalid_record))
      get :any_action

      response.code.should == "422"
      decoded_errors.fields.username.should == ["REQUIRED"]
    end

    it "renders string-based validation messages, when provided" do
      invalid_record = User.new
      invalid_record.errors.add(:username, "some error")
      controller.stub(:any_action).and_raise(ActiveRecord::RecordInvalid.new(invalid_record))
      get :any_action

      response.code.should == "422"
      decoded_errors.fields.username.should == ["some error"]
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

  describe "#present" do
    before do
      controller.stub(:object_to_present).and_return { object_to_present }
      log_in FactoryGirl.create :user
    end

    context "with a single model" do
      let(:object_to_present) { FactoryGirl.build(:user) }

      it "sets the response to a hash of the model" do
        get :action_that_presents
        decoded_response.username.should == object_to_present.username
      end
    end

    context "with a paginated collection" do
      before do
        FactoryGirl.create(:admin)
        FactoryGirl.create(:admin)
      end

      let(:object_to_present) do
        User.where(:admin => true).paginate(:per_page => 1, :page => 1)
      end

      it "sets the response to an array with a hash for each model in current page" do
        get :action_that_presents
        decoded_response.length.should == 1
        decoded_response[0].username.should == object_to_present[0].username
      end

      it "adds pagination" do
        get :action_that_presents
        decoded_pagination.page.should == 1
        decoded_pagination.per_page.should == 1
        decoded_pagination.total.should == 2
      end
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

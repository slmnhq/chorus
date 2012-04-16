require 'spec_helper'

describe UsersController do
  describe "#index" do
    context "before logging in" do
      it "says user is unauthorized" do
        get :index
        response.code.should == "401"
      end
    end

    context "after logging in" do
      let(:user) { User.create! :username => 'some_user', :password => 'secret', :password_confirmation => 'secret' }

      before do
        log_in user
      end

      it "shows list of users" do
        get :index
        response.code.should == "200"

        json = JSON.parse(response.body)
        json["response"].should be_present
        json["response"].length.should == 1
        json["response"].first["username"].should == "some_user"
      end
    end
  end
end
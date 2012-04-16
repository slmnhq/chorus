require 'spec_helper'

describe SessionsController do
  describe "#create" do
    before(:each) do
      @user = User.create :username => 'admin', :password => 'secret', :password_confirmation => 'secret'
    end

    describe "with the correct credentials" do
      before do
        post :create, :username => 'admin', :password => 'secret'
      end

      it "succeeds" do
        response.code.should == "201"
      end

      it "includes the user info in the response" do
        json = JSON.parse(response.body)
        json["response"].should be_present
        json["response"]["username"].should be_present
      end
    end

    describe "with incorrect credentials" do
      before do
        post :create, :username => 'admin', :password => 'public'
      end

      it "fails" do
        response.code.should == "401"
      end
    end
  end

  describe "#destroy" do
    it "returns no content" do
      delete :destroy
      response.code.should == "204"
    end
  end
end

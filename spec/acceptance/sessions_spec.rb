require 'spec_helper'

resource "Sessions", :type => :acceptance do
  let(:user) { FactoryGirl.create :admin }

  post "/sessions" do
    parameter :username, "username"
    parameter :password, "password"
    scope_parameters :session, [:username, :password]

    let(:username) { user.username }
    let(:password) { user.password }

    example_request "Login" do
      status.should == 201
    end
  end

  delete "/sessions" do
    before do
      log_in user
    end

    example_request "Logout", :document => false do
      status.should == 204
    end
  end

  get "/sessions" do
    before do
      log_in user
    end

    example_request "Check the session for validity" do
      status.should == 200
    end
  end
end

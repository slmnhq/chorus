require 'spec_helper'

resource "Sessions" do
  let(:user) { users(:admin) }

  post "/sessions" do
    parameter :username, "username"
    parameter :password, "password"

    let(:username) { user.username }
    let(:password) { FixtureBuilder.password }

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

    example_request "Check if the current user is still logged in" do
      status.should == 200
    end
  end
end

require 'spec_helper'

resource "User" do
  let!(:user) { FactoryGirl.create :user }
  let!(:admin) { FactoryGirl.create :admin }

  let(:id) { user.id }

  get "/users/:id" do
    before do
      log_in user
    end

    example_request "Get user details" do
      explanation <<-DESC
        Shows the specified user's details
      DESC

      status.should == 200
    end
  end

  put "/users/:id" do
    before do
      log_in user
    end

    example_request "Update user details" do
      explanation <<-DESC
        Update the specified user's details
      DESC

      status.should == 200
    end
  end

  delete "/users/:id" do
    before do
      log_in admin
    end

    example_request "Remove user" do
      explanation <<-DESC
        Delete the specified user
      DESC

      status.should == 200
    end
  end
end

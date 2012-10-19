require 'spec_helper'
require './spec/api_docs/image_hack'

resource "Users" do
  let(:user) { users(:admin) }
  let(:other_user) { users(:the_collaborator) }

  before do
    log_in user
  end

  get "/users" do
    pagination

    example_request "Get a list of users" do
      status.should == 200
    end
  end

  post "/users" do
    parameter :username, "Username"
    parameter :password, "Password - required unless LDAP authentication is enabled on the server"
    parameter :first_name, "First Name"
    parameter :last_name, "Last Name"
    parameter :email, "E-mail"
    parameter :title, "Title"
    parameter :dept, "Department"
    parameter :notes, "Notes"
    parameter :admin, "Make the user an admin. (Only allowed if the authenticated user is an admin)"

    required_parameters :username, :first_name, :last_name, :email

    let(:username) { "cookiemonster" }
    let(:first_name) { "Cookie" }
    let(:last_name) { "Monster" }
    let(:email) { "cookie@monster.com" }
    let(:password) { "secret" }
    let(:title) { "Chief Cookie Officer" }
    let(:dept) { "jar" }
    let(:notes) { "great" }

    example_request "Create a user" do
      status.should == 201
    end
  end

  get "/users/:id" do
    parameter :id, "Id of a user"

    required_parameters :id

    let(:id) { other_user.id }

    example_request "Get a user" do
      status.should == 200
    end
  end

  put "/users/:id" do
    parameter :id, "Id of a user"
    let(:id) { other_user.id }

    parameter :id, "Id of a user"
    parameter :first_name, "First Name"
    parameter :last_name, "Last Name"
    parameter :email, "E-mail"
    parameter :title, "Title"
    parameter :dept, "Department"
    parameter :notes, "Notes"
    parameter :admin, "Make the user an admin. (Only allowed if the authenticated user is an admin)"

    required_parameters :id, :first_name, :last_name, :email

    let(:first_name) { "Cookie1" }
    let(:last_name) { "Monster1" }
    let(:email) { "cookie@monster1.com" }
    let(:title) { "Cookie manager1" }
    let(:dept) { "jar1" }
    let(:notes) { "great1" }
    let(:admin) { "true" }

    example_request "Update a user's details" do
      status.should == 200
    end
  end

  delete "/users/:id" do
    parameter :id, "Id of a user"

    required_parameters :id

    let(:id) { other_user.id }

    example_request "Delete a user" do
      status.should == 200
    end
  end

  get "/users/ldap" do
    parameter :username, "Username"
    required_parameters :username

    let(:username) { other_user.username }

    before do
      stub(LdapClient).search.with_any_args { [other_user.attributes] }
    end

    example_request "Search for an LDAP user" do
      explanation "This method only works if LDAP is enabled on the server"
      status.should == 200
    end
  end

  post "/users/:user_id/image" do
    parameter :user_id, "Id of a user"
    parameter :files, "Image file"

    required_parameters :user_id

    let(:user_id) { user.to_param }
    let(:files) { [Rack::Test::UploadedFile.new(File.expand_path("spec/fixtures/small2.png", Rails.root), "image/png")] }

    example_request "Update a user's profile image" do
      status.should == 200
    end
  end

  get "/users/:user_id/image" do
    let(:user_id) { users(:owner).to_param }

    parameter :user_id, "Id of a user"
    parameter :style, "Size of image ( original, icon )"

    required_parameters :user_id

    example_request "Get a user's profile image" do
      status.should == 200
    end
  end
end

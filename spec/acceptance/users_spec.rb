require 'spec_helper'

resource "Users" do
  let!(:user) { FactoryGirl.create :admin }
  let!(:otherUser) { FactoryGirl.create :user }

  before do
    log_in user
  end

  get "/users" do
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
    parameter :admin, "Only settable if the authenticated user is an admin"

    required_parameters :username, :first_name, :last_name, :email
    scope_parameters :user, :all

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
    let(:id) { otherUser.id }

    example_request "Get a user" do
      status.should == 200
    end
  end

  put "/users/:id" do
    let(:id) { otherUser.id }

    parameter :username, "Username"
    parameter :first_name, "First Name"
    parameter :last_name, "Last Name"
    parameter :email, "E-mail"
    parameter :title, "Title"
    parameter :dept, "Department"
    parameter :notes, "Notes"
    parameter :admin, "Only settable if the authenticated user is an admin"

    required_parameters :username, :first_name, :last_name, :email
    scope_parameters :user, :all

    let(:username) { "Monster1" }
    let(:first_name) { "Cookie1" }
    let(:last_name) { "Monster1" }
    let(:email) { "cookie@monster1.com" }
    let(:title) { "Cookie manager1" }
    let(:dept) { "jar1" }
    let(:notes) { "great1" }
    let(:admin) { "true" }

    example_request "Update a user" do
      status.should == 200
    end
  end

  delete "/users/:id" do
    let(:id) { otherUser.id }

    example_request "Delete a user" do
      status.should == 200
    end
  end

  get "/users/ldap" do
    parameter :username, "Username"
    required_parameters :username

    let(:username) { otherUser.username }

    before do
      stub(LdapClient).search.with_any_args { [otherUser.attributes] }
    end

    example_request "Search for an LDAP user" do
      explanation "This method only works if LDAP is enabled on the server"
      status.should == 200
    end
  end
end
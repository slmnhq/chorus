require 'spec_helper'

describe "/users" do
  let!(:user) { User.create! :username => 'some_user', :password => 'secret', :first_name => "Jeau", :last_name => "Bleau", :email => "jb@emc.com" }

  before do
    post "/sessions", :username => "some_user", :password => "secret"
  end

  it "shows list of users for a get" do
    get "/users"
    response.code.should == "200"

    json = JSON.parse(response.body)
    json["response"].should be_present
    json["response"].length.should == 1
    json["response"].first["username"].should == "some_user"
  end
end
require File.join(File.dirname(__FILE__), 'spec_helper')

describe "creating a user" do
  before(:each) do
    login('edcadmin', 'secret')
  end

  it "displays error messages in a sane way" do
    visit("/#/users/new")

    field_errors.should be_empty
    click_add_user_button
    field_errors.should_not be_empty

    # user is a duplicate
    create_valid_user("edcadmin")
    field_errors.should be_empty
    wait_until { !server_errors.empty? }

    #user should be valid
    create_valid_user("partyman#{Time.now.to_i}")
    wait_until { current_route == "/users" }
  end
end
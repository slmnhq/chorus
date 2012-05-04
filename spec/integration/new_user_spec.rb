require File.join(File.dirname(__FILE__), 'spec_helper')

describe "creating a user" do
  before(:each) do
    login('edcadmin', 'secret')
  end

  it "displays error messages in a sane way" do
    visit("/#/users/new")

    field_errors.should be_empty
    click_submit_button
    field_errors.should_not be_empty

    # user is a duplicate
    visit("/#/users/new")
    fill_user_form("edcadmin")
    click_submit_button
    field_errors.should be_empty
    wait_until { !server_errors.empty? }

    #user should be valid
    create_valid_user("partyman#{Time.now.to_i}")
    wait_until { current_route == "/users" }
  end
end

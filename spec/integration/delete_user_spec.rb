require File.join(File.dirname(__FILE__), 'spec_helper')

describe "deleting a user" do
  before(:each) { login('edcadmin', 'secret') }

  it "deletes a user" do
    create_valid_user(:first_name => "Alex", :last_name =>"Reed", :username => "AlexReed")
    click_link "Alex Reed"
    wait_for_ajax
    click_link "Edit Profile"
    wait_for_ajax
    click_link "Delete User"
    click_button "Delete User"
    wait_until { current_route == '/users' }
    page.should_not have_content("Alex Reed")
  end

  it "doesnot delete a user who owns a workspace" do
    create_valid_user(:first_name => "Alex", :last_name =>"Reedy", :username => "AlexReedy")
    as_user("AlexReedy") do
      go_to_workspace_page
      create_valid_workspace()
    end

    as_user("edcadmin") do
      visit("#/users")
      wait_until { current_route == '/users' }
      click_link "Alex Reedy"
      wait_for_ajax
      click_link "Edit Profile"
      wait_for_ajax
      click_link "Delete User"
      click_button "Delete User"
      page.find(".error").should have_content("Can't delete user that still has workspaces associated")
    end
  end
end


require File.join(File.dirname(__FILE__), 'spec_helper')

describe "deleting a workspace" do
  before(:each) do
    login('edcadmin', 'secret')
  end

  it "deletes a user" do
    create_valid_user(:first_name => "Alex", :last_name =>"Reed", :username => "AlexReed")
    click_link "Alex Reed"
    wait_until { page.find("h1").text == "Alex Reed" }
    click_link "Edit Profile"
    wait_until { page.find("h1").text == "Alex Reed" }
    click_link "Delete User"
    click_button "Delete User"
    wait_until { current_route == '/users' }
    page.should_not have_content("Alex Reed")
  end

  it "doesnot delete a user who owns a workspace" do
    create_valid_user(:first_name => "Alex", :last_name =>"Reed", :username => "AlexReed")

    as_user("AlexReed") do
      go_to_workspace_page
      create_valid_workspace()
    end

    as_user("edcadmin") do
      go_to_user_list_page
      wait_until { current_route == '/users' }
      click_link "Alex Reed"
      wait_until { page.find("h1").text == "Alex Reed" }
      click_link "Edit Profile"
      wait_until { page.find("h1").text == "Alex Reed" }
      click_link "Delete User"
      click_button "Delete User"
      page.find(".error").should have_content("Can't delete user that still has workspaces associated")
    end
  end

  it "doesnot let an admin delete himself" do

    go_to_user_list_page
    within(".list") do
      click_link "EDC Admin"
    end
    page.should have_no_link("Delete User")

  end

end
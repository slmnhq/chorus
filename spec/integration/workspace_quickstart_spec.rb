require File.join(File.dirname(__FILE__), 'spec_helper')

describe "Showing the workspace quickstart page" do
  xit "shows the quickstart page on the first visit to a new workspace" do

    login('edcadmin', 'secret')
    create_valid_user(:first_name => "Peter", :last_name => "Parker", :username => "PeterParker")
    user_id = User.find_by_username("PeterParker").id

    visit("#/workspaces")
    wait_until { current_route == "/workspaces" && page.has_selector?("button[data-dialog=WorkspacesNew]") }
    click_button "Create Workspace"
    within("#facebox") do
        fill_in 'name', :with => "QuicklyStartedWorkspace"
        click_button "Create Workspace"
    end
    wait_until { current_route =~ /workspaces\/\d+\/quickstart/ && page.has_selector?("a.dismiss")}

    click_link "Add Team Members"


    wait_until { page.has_selector?("#facebox") && page.find("#facebox .dialog h1").text == "Edit Workspace Members" }

    within("#facebox") do
      within("li[data-id='#{user_id}']") do
        click_link "Add"
      end
      click_button "Save Changes"
    end

    wait_until { current_route =~ /workspaces\/\d+\/quickstart/ }
    page.should_not have_content("Add Team Members")

  end
end


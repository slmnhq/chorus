require File.join(File.dirname(__FILE__), 'spec_helper')

describe "Create workspaces" do

  it "creates a private workspace" do
    login('edcadmin', 'secret')
    go_to_workspace_page
    create_valid_workspace(:name => "Private Workspace", :shared => false)
    create_valid_user(:username => "private")
    logout
    login('private','secret')
    go_to_workspace_page
    page.should_not have_content ("Private Workspace")
  end

  it "creates a public workspace" do
    login('edcadmin', 'secret')
    create_valid_workspace
  end
end

describe "Delete a workspace" do

  xit "deletes the workspace" do
    login('edcadmin', 'secret')
    workspace_name = "DeleteWorkspace"
    create_valid_workspace(:name => workspace_name)
    click_link "Delete this Workspace"
    wait_until { page.has_selector?(".submit") }
    find(".submit").click

    visit('/#/workspaces')
    wait_until { current_route == '/#/workspaces' }
    page.execute_script("$('.popup').click()")
    click_link("All Workspaces")
    within(".workspace_list") { page.should_not have_content(workspace_name) }
  end
end



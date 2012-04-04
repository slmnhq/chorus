require File.join(File.dirname(__FILE__), 'spec_helper')

describe "creating a note on a workspace" do
  before(:each) do
    login('edcadmin', 'secret')
    create_valid_workspace
    wait_until { page.find('a[data-dialog="WorkspaceEditMembers"]').text == "Add or Edit Members"}
    click_link "Add or Edit Members"
    wait_until { page.has_selector?("#facebox") && page.find("#facebox .dialog h1").text == "Edit Workspace Members" }
  end
  it "Adds Members" do
    within("#facebox") do
    click_link "Add all"
    click_button "Save Changes"
    end
    click_link "Add or Edit Members"
    wait_until { page.has_selector?("#facebox") && page.find("#facebox .dialog h1").text == "Edit Workspace Members" }
    within("#facebox") do
    click_link "Remove all"
    click_button "Save Changes"
    end
  end
end

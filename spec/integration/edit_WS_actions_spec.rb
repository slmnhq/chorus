require File.join(File.dirname(__FILE__), 'spec_helper')

describe "creating a note on a workspace" do
  before(:each) do
    login('edcadmin', 'secret')
    create_valid_workspace
    wait_until { page.find('a[data-dialog="WorkspaceSettings"]').text == "Edit Workspace"}
    click_link "Edit Workspace"
    wait_until { page.find("#facebox .dialog h1").text == "Workspace Settings" }
  end

  xit "edits workspace settings" do
    within("#facebox") do
    fill_in 'name', :with => "change_ws_name#{Time.now.to_i}"
#    set_cleditor_value("body", "Changing the summary of the workspace")
    choose("workspace_archived")
    find(".submit").click
    end
 # wait_until { page.find(".dailog h1).text == "Change_ws_name#" }
  end
end


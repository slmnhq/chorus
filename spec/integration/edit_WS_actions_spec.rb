require File.join(File.dirname(__FILE__), 'spec_helper')

describe "creating a note on a workspace" do
  before(:each) do
    login('edcadmin', 'secret')
    create_valid_workspace
    wait_until { page.find('a[data-dialog="WorkspaceSettings"]').text == "Edit Workspace"}
    click_link "Edit Workspace"
    wait_until { page.find("#facebox .dialog h1").text == "Workspace Settings" }
  end

  it "edits workspace settings" do
    within("#facebox") do
      fill_in 'name', :with => "change_ws_name#{Time.now.to_i}"
      set_cleditor_value("summary", "Changing the <b>summary</b> <script>foo</script> of the workspace")
      #choose("workspace_archived")

      find(".submit").click
    end
    page.find(".styled_text").should have_content "Changing the summary of the workspace"
  end
end


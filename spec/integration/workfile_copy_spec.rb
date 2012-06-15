require File.join(File.dirname(__FILE__), 'spec_helper')

describe "copy a workfile" do
  before(:each) do
    login('edcadmin', 'secret')
  end

  it "copies the file to another workspace" do
    create_valid_workspace(:name => "sourceworkspace")
    @source_workspace_id = Workspace.find_by_name("sourceworkspace").id
    click_link "Work Files"
    page.find("h1").should have_content("Work Files")
    click_button "Create SQL File"
    wf_name = "workfile"
    within "#facebox" do
      fill_in 'fileName', :with => wf_name
      click_button "Add SQL File"
    end

    visit("#/workspaces")
    @workfile_id = Workfile.find_by_file_name("workfile.sql").id

    create_valid_workspace(:name => "targetworkspace")
    @target_workspace_id = Workspace.find_by_name("targetworkspace").id
    visit("#/workspaces/#{@source_workspace_id}/quickstart")

    click_link "Work Files"
    wait_until { current_route =~ /workspaces\/\d+\/workfiles/ }
    within(".workfile_list") do
      page.find("li[data-id='#{@workfile_id}']").click
    end

    click_link "Copy latest version to another workspace"
    within(".collection_list") do
      page.find("li[data-id='#{@target_workspace_id}']").click
    end

    click_button "Copy File"
    visit("#/workspaces/#{@target_workspace_id}/quickstart")
    wait_until { page.find('a[data-dialog="WorkspaceSettings"]').text == "Edit Workspace" }
    click_link "Work Files"
    wait_until { page.find('button[data-dialog="WorkfilesImport"]').text == "Upload File" }
    workfiles = page.all("li.workfile")
    workfiles.first.text.should == "workfile.sql"
  end

  it "copies the file to another workspace and take care of file name" do

    @source_workspace_id = Workspace.find_by_name("sourceworkspace").id
    @target_workspace_id = Workspace.find_by_name("targetworkspace").id
    @workfile_id = Workfile.find_by_file_name("workfile.sql").id
    visit("#/workspaces/#{@source_workspace_id}/quickstart")
    wait_until { page.find('a[data-dialog="WorkspaceSettings"]').text == "Edit Workspace" }
    click_link "Work Files"
    wait_until { current_route =~ /workspaces\/\d+\/workfiles/ }
    within(".workfile_list") do
      page.find("li[data-id='#{@workfile_id}']").click
    end
    click_link "Copy latest version to another workspace"
    within(".collection_list") do
      page.find("li[data-id='#{@target_workspace_id}']").click
    end
    click_button "Copy File"
    visit("#/workspaces/#{@target_workspace_id}/quickstart")
    wait_until { page.find('a[data-dialog="WorkspaceSettings"]').text == "Edit Workspace" }
    click_link "Work Files"
    wait_until { page.find('button[data-dialog="WorkfilesImport"]').text == "Upload File" }
    workfiles = page.all("li.workfile")
    workfiles.first.text.should == "workfile.sql"
    workfiles.last.text.should == "workfile_1.sql"
  end
end

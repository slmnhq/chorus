require File.join(File.dirname(__FILE__), 'spec_helper')

describe "add a workfile" do
  before(:each) do
    login('edcadmin', 'secret')
  end

  it "creates a simple workfile" do
    create_valid_workspace
    create_valid_workfile
  end

  it "uploads a workfile from the local system" do
    create_valid_workspace
    click_link "Work Files"
    wait_for_ajax
    click_button("Upload File")
    wait_for_ajax
    within_modal do
      attach_file("workfile[versions_attributes][0][contents]", File.join(File.dirname(__FILE__), '../fixtures/some.txt'))
      click_button("Upload File")
      wait_for_ajax
    end
    click_link "Work Files"
    page.should have_content "some.txt"
  end
end

describe "Deleting workfiles" do
  before(:each) { login('edcadmin', 'secret') }

  it "deletes an uploaded file from the show page" do
    create_valid_workspace(:name => "workfile_delete")
    wait_until { page.find('a[data-dialog="WorkspaceSettings"]').text == "Edit Workspace" }
    click_link("Work Files")
    click_button("Upload File")
    within_modal do
      attach_file("workfile[versions_attributes][0][contents]", File.join(File.dirname(__FILE__), '../fixtures/some.txt'))
      click_button("Upload File")
      wait_for_ajax
    end
    click_link("Work Files")
    page.should have_content("some.txt")
    click_link "some.txt"
    click_link "Delete"

    within_modal do
      click_submit_button
    end
    page.should_not have_content("some.txt")
  end
end

describe "workfiles list page" do
  before(:all) do
    login('edcadmin', 'secret')
    create_valid_workspace(:name => "WorkfileListWorkspace")
    wait_until { page.find('a[data-dialog="WorkspaceSettings"]').text == "Edit Workspace" }
    create_valid_workfile({:name => "wf4"})
    create_valid_workfile({:name => "wf1"})
  end

  describe "Lists the work files" do
    before(:each) do
      login('edcadmin', 'secret')
      workspace_id = Workspace.find_by_name("WorkfileListWorkspace").id
      visit("#/workspaces/#{workspace_id}/workfiles")
      wait_for_ajax
    end

    it "Lists the work files by updated date when selected" do
      click_link("Alphabetically")
      click_link("By Date")
      wait_for_ajax
      workfiles = page.all("li.workfile")

      workfiles.first.text.should == "wf4.sql"
      workfiles.last.text.should == "wf1.sql"
    end
  end
end
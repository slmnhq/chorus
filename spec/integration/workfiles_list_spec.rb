require File.join(File.dirname(__FILE__), 'spec_helper')

describe "workfiles list page" do
  before(:all) do
    login('edcadmin', 'secret')

    create_valid_workspace(:name => "WorkfileListWorkspace")
    wait_until { page.find('a[data-dialog="WorkspaceSettings"]').text == "Edit Workspace" }
    create_valid_workfile({:name => "wf4"})
    create_valid_workfile({:name => "wf3"})
    create_valid_workfile({:name => "wf2"})
    create_valid_workfile({:name => "wf1"})
  end

  describe "Lists the work files" do
    before(:each) do
      login('edcadmin', 'secret')
      @workspace_id = Workspace.find_by_name("WorkfileListWorkspace").id
      visit("#/workspaces/#{@workspace_id}/workfiles")

      wait_until { page.find('button[data-dialog="WorkfilesImport"]').text == "Upload File" }
    end


    it "Lists the work files by default ordered by file name " do
      workfiles = page.all("li.workfile")

      workfiles.first.text.should == "wf1.sql"
      workfiles.last.text.should == "wf4.sql"
    end

    it "Lists the work files by updated date when selected" do
      click_link("Alphabetically")
      click_link("By Date")
      sleep(1)
      workfiles = page.all("li.workfile")

      workfiles.first.text.should == "wf4.sql"
      workfiles.last.text.should == "wf1.sql"
    end
  end



end
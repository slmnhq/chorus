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

  it "creates and displays a text workfile using file sort" do
    create_valid_workspace(:name => "FooWorkspaceWithText")
    wait_until { page.find('a[data-dialog="WorkspaceSettings"]').text == "Edit Workspace"}
    click_link("Work Files")
    click_button("Upload File")
    sleep(2)
    within("#facebox") do
      attach_file("workfile[contents]", File.join(File.dirname(__FILE__), '../fixtures/some.txt'))
      click_button("Upload File")
    end
    wait_until { current_route =~ /workspaces\/\d+\/workfiles\/\d+/ }
    within(".text_workfile_content") do
      page.should have_content("hello")
    end
    click_link "Work Files"
    sleep(1)
    click_link("All files")
    click_link("Text files")
    within(".workfile_list") do
      page.should have_content("some.txt")
    end
  end

  it "creates and lists sql workfiles" do
    create_valid_workfile ({:name => "listingsql"})
    click_link "Work Files"
    sleep(1)
    click_link("All files")
    click_link("SQL files")
    within(".workfile_list") do
      page.should have_content("listingsql.sql")
    end
  end

  it "creates and lists img workfiles" do
    create_valid_workspace(:name => "FooWorkspaceWithImage")
    wait_until { page.find('a[data-dialog="WorkspaceSettings"]').text == "Edit Workspace"}
    click_link("Work Files")
    click_button("Upload File")
    within("#facebox") do
      attach_file("workfile[contents]", File.join(File.dirname(__FILE__), '../fixtures/small2.png'))
      click_button("Upload File")
      sleep(2)
    end

    wait_until { current_route =~ /workspaces\/\d+\/workfiles\/\d+/ }
    within(".image_workfile_content") do
      page.find("img")["src"].should match(/small2.png/)
    end
    click_link "Work Files"
    sleep(1)
    click_link("All files")
    click_link("Image files")
    within(".workfile_list") do
      page.should have_content("small2.png")
    end
  end

end
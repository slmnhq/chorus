require File.join(File.dirname(__FILE__), 'spec_helper')

describe "add a workfile" do
  before(:each) do
    login('edcadmin', 'secret')
  end

  it "creates and displays an uploaded workfile and resolves a name conflict" do
    create_valid_workspace(:name => "WorkspaceForFileNameConflict")
    wait_until { page.find('a[data-dialog="WorkspaceSettings"]').text == "Edit Workspace" }

    create_valid_workfile(:name => "sqlfile")
    click_link "Work Files"
    click_button "Create SQL File"
    within_modal do
      fill_in 'fileName', :with => "sqlfile"
      click_button "Add SQL File"
      wait_for_ajax
    end

    click_link("Work Files")
    wait_for_ajax
    click_button("Upload File")
    wait_for_ajax

    within_modal do
      attach_file("workfile[contents]", File.join(File.dirname(__FILE__), '../fixtures/some.txt'))
      click_button("Upload File")
      wait_for_ajax
    end
    click_link("Work Files")
    wait_for_ajax
    click_button("Upload File")
    wait_for_ajax

    within_modal do
      attach_file("workfile[contents]", File.join(File.dirname(__FILE__), '../fixtures/some.txt'))
      click_button("Upload File")
      wait_for_ajax
    end

    click_link("Work Files")
    wait_for_ajax
    workfiles = page.all("li.workfile")
    workfiles.map(&:text).should =~ [
      "some.txt",
      "some_1.txt",
      "sqlfile.sql",
      "sqlfile_1.sql"
    ]
  end
end

require File.join(File.dirname(__FILE__), 'spec_helper')

describe " add an instance " do
  before(:each) do
    login('edcadmin', 'secret')
  end

  it "deletes a SQL workfile from the workfile show page" do

    create_valid_workspace(:name => "delete_workfile")
    create_valid_workfile(:name => "sample")
    click_link "Work Files"
    page.should have_content("sample.sql")
    click_link "sample.sql"
    click_link "Delete"
    within ("#facebox") do
      click_submit_button
    end
    page.should_not have_content("sample.sql")
  end

  it "deletes an uploaded file from the show page" do

    create_valid_workspace(:name => "workfile_delete")
    wait_until { page.find('a[data-dialog="WorkspaceSettings"]').text == "Edit Workspace" }
    click_link("Work Files")
    click_button("Upload File")
    within("#facebox") do
      attach_file("workfile[contents]", File.join(File.dirname(__FILE__), '../fixtures/some.txt'))
      click_button("Upload File")
      sleep(2)
    end
    click_link("Work Files")
    page.should have_content("some.txt")
    click_link "some.txt"
    click_link "Delete"
    within ("#facebox") do
      click_submit_button
    end
    page.should_not have_content("some.txt")

  end

  xit "hides the delete link when am not a member of the workspace"do

    create_valid_workspace(:name => "not a member delete")
    wait_until { page.find('a[data-dialog="WorkspaceSettings"]').text == "Edit Workspace" }
    create_valid_workfile(:name => "invalid_member")
    create_valid_user(:username => "notamember")

    login('notamember','secret')
    go_to_workspace_page
    page.should have_content ("not a member delete")
    click_link "not a member delete"
    click_link "Work Files"
    page.should have_content ("invalid_member.sql")
    click_link ("invalid_member.sql")
    page.should have_no_link("Delete")
  end

end




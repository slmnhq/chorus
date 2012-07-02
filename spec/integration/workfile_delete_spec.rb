require File.join(File.dirname(__FILE__), 'spec_helper')

describe "Deleting workfiles" do
  before(:each) { login('edcadmin', 'secret') }

  it "deletes an uploaded file from the show page" do
    create_valid_workspace(:name => "workfile_delete")
    wait_until { page.find('a[data-dialog="WorkspaceSettings"]').text == "Edit Workspace" }
    click_link("Work Files")
    click_button("Upload File")
    within_modal do
      attach_file("workfile[contents]", File.join(File.dirname(__FILE__), '../fixtures/some.txt'))
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




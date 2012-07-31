require File.join(File.dirname(__FILE__), '../integration/spec_helper')

describe "deleting a note on a workspace" do

  it "deletes the note" do
    login('edcadmin','secret')
    create_valid_workspace(:name => "Note Delete", :shared => true)
    wait_for_ajax
    page.should have_content "Add a note"
    click_link "Add a note"
    wait_for_ajax
    within_modal do
      set_cleditor_value("body", "This note will be deleted")
      click_submit_button
      wait_for_ajax
    end
    page.execute_script("$('{.delete_link.alert}').click();")
    click_submit_button
    wait_for_ajax
    page.should_not have_content("EDC Admin commented on the workspace Note Delete")

    go_to_home_page
    wait_for_ajax
    page.should_not have_content("EDC Admin commented on the workspace Note Delete")

    go_to_user_list_page
    wait_for_ajax
    within(".list")  do
      click_link "EDC Admin"
    end
    wait_for_ajax
    page.should_not have_content("EDC Admin commented on the workspace Note Delete")

  end

end
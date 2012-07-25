require File.join(File.dirname(__FILE__), '../integration/spec_helper.rb')

describe "creating a note on the hadoop file" do

it "contains the new note on hadoop" do
  login('edcadmin', 'secret')
  new_instance_name = "Hadoop_file"
  create_valid_hadoop_instance(:name => new_instance_name)
  click_link new_instance_name
  click_link "README.txt"
  wait_until { page.has_selector?('a[data-dialog="NotesNew"]') }
  sleep(1)
  click_link "Add a note"

  within_modal do
    set_cleditor_value("body", "Note on the hadoop file")
    click_submit_button
    wait_for_ajax
  end

  page.should have_content("Note on the hadoop file")
end
end

describe "creating a note on a dataset" do

  it "contains a note on the dataset" do
    login('edcadmin', 'secret')
    create_gpdb_instance(:name => "note_dataset")
    wait_for_ajax
    click_link "note_dataset"
    wait_for_ajax
    click_link "gpdb_garcia"
    wait_for_ajax
    click_link "test_schema"
    click_link "Add a note"
    within_modal do
      set_cleditor_value("body", "Note on a dataset")
      click_submit_button
      wait_for_ajax
    end
    page.should have_content("Note on a dataset")

  end

end

describe "deleting a note on a dataset" do

  it "deletes the note" do
    login('edcadmin','secret')
    create_valid_workspace(:name => "Note Delete", :shared => true)
    wait_for_ajax
    click_link "Add a note"
    within_modal do
      set_cleditor_value("body", "This note will be deleted")
      click_submit_button
      wait_for_ajax
    end
    page.execute_script("$('{.delete_link.alert}').click();")
    click_submit_button
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
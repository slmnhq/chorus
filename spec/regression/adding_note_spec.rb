require File.join(File.dirname(__FILE__), '../integration/spec_helper.rb')

describe "creating a note on a hadoop instance" do
  it "contains the new note on gpdb" do
    login('edcadmin', 'secret')
    new_instance_name = "HD_inst_sel_test#{Time.now.to_i}"
    create_valid_hadoop_instance(:name => new_instance_name)
    wait_until { page.has_selector?('a[data-dialog="NotesNew"]') }
    sleep(1)
    click_link "Add a note"

    within_modal do
      set_cleditor_value("body", "Note on the hadoop instance")
      click_submit_button
      wait_for_ajax
    end

    page.should have_content("Note on the hadoop instance")
  end
end

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
    click_link "gpdb_test_schema"
    click_link "Add a note"
    within_modal do
      set_cleditor_value("body", "Note on a dataset")
      click_submit_button
      wait_for_ajax
    end
    page.should have_content("Note on a dataset")

  end

end


describe "creating a note on a workfile" do

  it "contains a note on the workfile list page" do
    login('edcadmin', 'secret')
    create_valid_workspace
    create_valid_workfile(:name => "notewf")
    click_link "Add a note"
    within_modal do
      set_cleditor_value("body", "Note on a workfile")
      click_submit_button
      wait_for_ajax
    end
    page.should have_content("Note on a workfile")

  end

  it "contains a note on the workfile show page" do

    login('edcadmin', 'secret')
    create_valid_workspace
    create_valid_workfile(:name => "notewf1")
    click_link "notewf1"
    wait_for_ajax
    click_link "Add a note"
    within_modal do
      set_cleditor_value("body", "Note on a workfile show page")
      click_submit_button
      wait_for_ajax
    end
    page.should have_content("Note on a workfile show page")

  end


end

describe "creating a note on the workspace" do

  it "contains the new note on workspace" do
    login('edcadmin', 'secret')
    create_valid_workspace
    wait_until { page.has_selector?('a[data-dialog="NotesNew"]') }
    sleep(1)
    click_link "Add a note"

    within_modal do
      set_cleditor_value("body", "Note on the workspace")
      click_submit_button
      wait_for_ajax
    end

    page.should have_content("Note on the workspace")
  end
end
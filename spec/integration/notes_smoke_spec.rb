require File.join(File.dirname(__FILE__), 'spec_helper')

describe "creating a note on a GPDB instance" do
  it "contains the new note" do
    login('edcadmin', 'secret')
    new_instance_name = "GPDB_inst_sel_test#{Time.now.to_i}"
    create_gpdb_instance(:name => new_instance_name)
    wait_until { page.has_selector?('a[data-dialog="NotesNew"]') }
    wait_for_ajax
    click_link "Add a note"

    within_modal do
      set_cleditor_value("body", "Note on the instance")
      click_submit_button
      wait_for_ajax
    end

    page.find(".activity_content").should have_content("Note on the instance")
  end
end

describe "creating a note on a workspace" do

  it "creates a note on the workspace" do
    login('edcadmin', 'secret')
    create_valid_workspace
    wait_until { page.has_selector?('a[data-dialog="NotesNew"]') }
    click_link "Add a note"
    wait_until { page.has_selector?("#facebox .dialog h1") }
    within_modal do
      set_cleditor_value("body", "Note on the workspace")
      click_submit_button
      wait_for_ajax
    end
    page.find(".activity_content").should have_content("Note on the workspace")
  end
end


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

end
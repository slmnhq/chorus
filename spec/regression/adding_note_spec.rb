require File.join(File.dirname(__FILE__), '../integration/spec_helper.rb')

describe "creating a note on the hadoop file" do

it "contains the new note on hadoop file" do
  login('edcadmin', 'secret')
  new_instance_name = "Hadoop_file"
  create_valid_hadoop_instance(:name => new_instance_name)
  click_link new_instance_name
  click_link "case_sf_311.csv"
  wait_until { page.has_selector?('a[data-dialog="NotesNew"]') }
  sleep(1)
  click_link "Add a note"
  set_cleditor_value("body", "Note on the hadoop file")
  click_submit_button

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
    end
    page.should have_content("Note on a dataset")

  end

end

describe "adding multiple files to a note" do

  it"attaches multiple files to a note" do

    login('edcadmin', 'secret')
    create_valid_workspace
    wait_until { page.has_selector?('a[data-dialog="NotesNew"]') }
    click_link "Add a note"
    wait_until { page.has_selector?("#facebox .dialog h1") }
    within_modal do
      set_cleditor_value("body", "Note on the workspace with multiple files")
      click_link "Show options"
      attach_file("fileToUpload[contents]", File.join(File.dirname(__FILE__), '../fixtures/small2.png'))
      attach_file("fileToUpload[contents]", File.join(File.dirname(__FILE__), '../fixtures/some.txt'))
      attach_file("fileToUpload[contents]", File.join(File.dirname(__FILE__), '../fixtures/somepdf.pdf'))
      click_submit_button
      wait_for_ajax
    end
    page.find(".activity_content").should have_content("Note on the workspace with multiple files")
    page.should have_content "small2.png"
    page.should have_content "some.txt"
    page.should have_content "somepdf.pdf"
  end

end

describe "adding multiple datasets to a note" do

  it "adds multiple datasets" do
    login('edcadmin', 'secret')
    create_valid_workspace(:name => "multiple datasets")
    workspace_id = Workspace.find_by_name("multiple datasets").id
    create_gpdb_instance(:name => "datanote", :host => "chorus-gpdb42.sf.pivotallabs.com")
    click_link "datanote"
    sleep(2)
    click_link "gpdb_chorus_ci"
    sleep(2)
    click_link "gpdb_test_schema"
    sleep(3)
    wait_for_ajax
    page.should have_content "base_table1"
    page.should have_content "All"
    click_link "All"
    wait_for_ajax
    click_link "Associate with a workspace"
    within(".collection_list") do
      page.find("li[data-id='#{workspace_id}']").click
    end
    click_button "Associate Datasets"
    go_to_workspace_page
    click_link "multiple datasets"
    wait_until { page.has_selector?('a[data-dialog="NotesNew"]') }
    click_link "Add a note"
    wait_until { page.has_selector?("#facebox .dialog h1") }
    set_cleditor_value("body", "Note on the workspace with multiple datasets")
    click_link "Show options"
    click_link "Dataset"
    data1_id = Dataset.find_by_name("base_table1").id
    data2_id = Dataset.find_by_name("master_table1").id
    data3_id = Dataset.find_by_name("view1").id
      within (".collection_list") do
        page.find("li[data-id='#{data1_id}']").click
        page.find("li[data-id='#{data2_id}']").click
        page.find("li[data-id='#{data3_id}']").click
      end
    click_button 'Attach Datasets'
    wait_for_ajax
    click_button 'Add Note'
    click_link "Data"
    wait_for_ajax
    click_link "Summary"
    page.should have_content "Note on the workspace with multiple datasets"
    page.should have_content "base_table1"

  end

end
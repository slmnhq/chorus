require File.join(File.dirname(__FILE__), '../integration/spec_helper')

describe "associating dataset to a workspace" do

  it "Associates a dataset to a workspace" do

    login('edcadmin','secret')
    create_valid_workspace(:name => "associate_dataset")
    wait_for_ajax
    workspace_id = Workspace.find_by_name("associate_dataset").id
    create_gpdb_instance(:name => "data_associate")
    click_link"data_associate"
    wait_for_ajax
    click_link "gpdb_garcia"
    wait_for_ajax
    click_link "gpdb_test_schema"
    wait_for_ajax
    page.should have_content "base_table1"
    click_link "Associate dataset with a workspace"

    within(".collection_list") do
      page.find("li[data-id='#{workspace_id}']").click
    end
    click_submit_button
    wait_for_ajax
    go_to_workspace_page
    click_link "associate_dataset"
    click_link "Data"
    page.should have_content "base_table1"
    
  end

end
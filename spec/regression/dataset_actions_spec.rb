require File.join(File.dirname(__FILE__), '../integration/spec_helper')

#This file has the selenium tests for dataset actions. The actions are as follows:
#Viewing a dataset inside a GPDB instance
#includes the view's statistics, metadata and definition
#associating dataset to a workspace
#Run Analyze on a table

describe "Viewing data inside GPDB instances" do
  let(:instance_name) { "Instance#{Time.now.to_i}" }
  let(:database_name) { "gpdb_garcia" }
  let(:schema_name) { "gpdb_test_schema" }

  before(:each) do
    login('edcadmin', 'secret')

    create_gpdb_instance(:name => instance_name)

    click_link instance_name
    click_link database_name
    click_link schema_name
    click_link dataset_name
  end

  context "for a table" do
    let(:dataset_name) { "base_table1" }

    it "displays a data preview" do
      click_button "Data Preview"

      within(".data_table") do
        page.should have_selector(".th")
      end
    end

    it "includes the table's statistics and metadata" do
      within "#sidebar" do
        page.find("li[data-name='statistics']").click
      end

      within ".statistics_detail" do
        # TODO we can't make assertions about things that change such as last_analyzed and disk_size
        page.should have_content("Source Table")
      end
    end
  end

  context "on a view" do
    let(:dataset_name) { "view1" }

    it "includes the view's statistics, metadata and definition" do
      within "#sidebar" do
        page.find("li[data-name='statistics']").click
      end

      within ".statistics_detail" do
        page.should have_content("Source View")
      end

      within ".definition" do
        page.should have_content("SELECT base_table1.id, base_table1.column1, base_table1.column2, base_table1.category FROM base_table1;")
      end
    end
  end

end

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

describe "run analyze on a table" do
  before(:each) do
    login('edcadmin', 'secret')
  end

  it "runs analyze on a table from instance browsing view" do
    create_gpdb_instance(:name => "RunAnalyze")
    wait_for_ajax
    click_link("RunAnalyze")
    wait_for_ajax
    click_link("gpdb_garcia")
    wait_for_ajax
    click_link("gpdb_test_schema")
    wait_for_ajax
    click_link ("Run Analyze")
    click_button "Run Analyze"
    wait_for_ajax(10)
    page.should have_content("Analyze is running")
  end
end


describe "download a dataset" do

  it "runs analyze on a table from instance browsing view" do
    login('edcadmin', 'secret')
    create_gpdb_instance(:name => "download_dataset")
    wait_for_ajax
    click_link("download_dataset")
    wait_for_ajax
    click_link("ChorusAnalytics")
    sleep(2)
    click_link("analytics")
    sleep(1)
    click_link("2009_sfo_customer_survey")
    wait_for_ajax
    click_button "Data Preview"
    wait_for_ajax
    click_link "Download"
    within_modal do
      click_submit_button
    end
  end
end

describe "de-associating dataset to a workspace" do

  it "de-Associates a dataset to a workspace" do

    login('edcadmin','secret')
    create_valid_workspace(:name => "deassociate_dataset")
    wait_for_ajax
    workspace_id = Workspace.find_by_name("deassociate_dataset").id
    create_gpdb_instance(:name => "data_deassociate")
    click_link"data_deassociate"
    wait_for_ajax
    click_link "gpdb_garcia"
    wait_for_ajax
    click_link "gpdb_test_schema"
    wait_for_ajax
    page.should have_content "external_web_table1"
    click_link "Associate dataset with a workspace"

    within(".collection_list") do
      page.find("li[data-id='#{workspace_id}']").click
    end
    click_submit_button
    wait_for_ajax
    go_to_workspace_page
    click_link "deassociate_dataset"
    wait_for_ajax
    click_link "Data"
    wait_for_ajax
    page.should have_content "external_web_table1"
    click_link "Delete association"
    click_submit_button
    wait_for_ajax
    page.should_not have_content "external_web_table1"

  end
end

describe "adding multiple datasets to a workspace" do

  it "adds multiple datasets to a workspace" do
    login('edcadmin', 'secret')
    create_valid_workspace(:name => "multiple ws datasets")
    workspace_id = Workspace.find_by_name("multiple ws datasets").id
    create_gpdb_instance(:name => "multiplews", :host => "chorus-gpdb42.sf.pivotallabs.com")
    click_link "multiplews"
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
    click_link "multiple ws datasets"
    wait_until { page.has_selector?('a[data-dialog="NotesNew"]') }
    click_link "Data"
    page.should have_content "base_table1"
    page.should have_content "view1"
    page.should have_content "external_web_table1"
  end
end
require File.join(File.dirname(__FILE__), 'spec_helper')

describe "Viewing data inside GPDB instances" do
  before(:each) do
    login('edcadmin', 'secret')
  end

  xit "can preview a dataset" do
    create_valid_instance(:name => "InstanceToPreviewData")
    click_link "InstanceToPreviewData"
    click_link "Analytics"
    click_link "analytics"

    dataset_id = Instance.find_by_name("InstanceToPreviewData").databases.find_by_name("Analytics").schemas.find_by_name("analytics").database_objects.find_by_name("a1000").id

    page.find("li[data-database-object-id='#{dataset_id}']").click
    sleep(1)
    click_link "Preview Data"
    within(".data_table") do
      page.should have_selector(".th")
    end
  end
end

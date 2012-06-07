require File.join(File.dirname(__FILE__), 'spec_helper')

describe "Viewing data inside GPDB instances" do
  before(:each) do
    login('edcadmin', 'secret')
  end

  it "can preview a table" do
    create_valid_instance(:name => "InstanceToPreviewData")
    click_link "InstanceToPreviewData"
    click_link "Analytics"
    click_link "analytics"

    table_id = Instance.find_by_name("InstanceToPreviewData").databases.find_by_name("Analytics").schemas.find_by_name("analytics").database_objects.find_by_name("a1000").id

    page.find("li[data-database-object-id='#{table_id}']").click
    sleep(1)
    click_link "Preview Data"
    within(".data_table") do
      page.should have_selector(".th")
    end
  end

  it "can view a tables statistics and metadata" do
    create_valid_instance(:name => "InstanceToViewStatistics1")
    click_link "InstanceToViewStatistics1"
    click_link "Analytics"
    click_link "analytics"

    dataset_id = Instance.find_by_name("InstanceToViewStatistics1").databases.find_by_name("Analytics").schemas.find_by_name("analytics").database_objects.find_by_name("a1000").id

    page.find("li[data-database-object-id='#{dataset_id}']").click
    sleep(1)

    within "#sidebar" do
      page.find("li[data-name='statistics']").click
    end

    within ".statistics_detail" do
      # TODO we can't make assertions about things that change such as last_analyzed and disk_size
      page.should have_content("Source Table")
      page.should have_content("Columns 5")
      page.should have_content("Rows 1000")
    end
  end

  it "can view a views statistics, metadata and definition" do
    create_valid_instance(:name => "InstanceToViewStatistics2")
      click_link "InstanceToViewStatistics2"
      click_link "Analytics"
      click_link "analytics"

      dataset_id = Instance.find_by_name("InstanceToViewStatistics2").databases.find_by_name("Analytics").schemas.find_by_name("analytics").database_objects.find_by_name("___lenny").id

      page.find("li[data-database-object-id='#{dataset_id}']").click
      sleep(1)

      within "#sidebar" do
        page.find("li[data-name='statistics']").click
      end

      within ".statistics_detail" do
        page.should have_content("Source View")
        page.should have_content("Columns 2")
        page.should have_content("Description This is the comment on view - __lenny")
      end

      within(".content") do
        click_link("___lenny")
      end

      within ".definition" do
        page.should have_content("SELECT a.artist, a.title FROM top_1_000_songs_to_hear_before_you_die a;")
      end
  end
end

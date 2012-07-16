require File.join(File.dirname(__FILE__), 'spec_helper')

describe "Viewing data inside GPDB instances" do
  let(:instance_name) { "Instance#{Time.now.to_i}" }
  let(:database_name) { "Analytics" }
  let(:schema_name) { "analytics" }

  before(:each) do
    login('edcadmin', 'secret')

    create_gpdb_gillette_instance(:name => instance_name)

    click_link instance_name
    click_link database_name
    click_link schema_name
    click_link dataset_name
  end

  context "for a table" do
    let(:dataset_name) { "a1000" }

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
        page.should have_content("Columns 5")
        page.text.should =~ /Rows \d+/
      end
    end
  end

  context "on a view" do
    let(:dataset_name) { "__lenny" }

    it "includes the view's statistics, metadata and definition" do
      within "#sidebar" do
        page.find("li[data-name='statistics']").click
      end

      within ".statistics_detail" do
        page.should have_content("Source View")
        page.should have_content("Columns 2")
        page.should have_content("Description This is the comment on view - __lenny")
      end

      within ".definition" do
        page.should have_content("SELECT a.artist, a.title FROM top_1_000_songs_to_hear_before_you_die a;")
      end
    end
  end

  xit "Dataset includes list of workspaces which it is associated" do

  end

  xit "Memeber can disassociate a data set from workspace" do

  end

  xit "Several datasets can be associated with workspace" do

  end
end

require File.join(File.dirname(__FILE__), 'spec_helper')

describe " add an instance " do
  before(:each) do
    login('edcadmin', 'secret')
  end

  it "creates an instance" do
    create_valid_instance(:name => "InstanceWithSchemas")
    click_link("InstanceWithSchemas")
    click_link("Analytics")
    click_link("analytics")
  end


  it "runs analyze on a table from instance browsing view" do
      create_valid_instance(:name => "RunAnalyze")
      click_link("RunAnalyze")
      click_link("Analytics")
      click_link("public")
      click_link ("Run Analyze")
      click_button "Run Analyze"
      page.should have_content("Analyze is running")
    end
end

require File.join(File.dirname(__FILE__), 'spec_helper')

describe " add an instance " do
  before(:each) do
    login('edcadmin', 'secret')
  end

  it "runs analyze on a table from instance browsing view" do
    create_gpdb_gillette_instance(:name => "RunAnalyze")
    click_link("RunAnalyze")
    wait_for_ajax
    click_link("Analytics")
    wait_for_ajax
    click_link("public")
    wait_for_ajax
    click_link ("Run Analyze")
    click_button "Run Analyze"
    wait_for_ajax(10)
    page.should have_content("Analyze is running")
  end

  xit "Associate a table/view with workspace (27928559)" do

  end
end

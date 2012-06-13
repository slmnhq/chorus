require File.join(File.dirname(__FILE__), 'spec_helper')

describe "creating a note on a workspace" do
  before(:each) do
    login('edcadmin', 'secret')

  end

  it "clicks on the insights link on the home page" do

    click_link "Insights"
    wait_until {page.find(".title h1").text == "Insights"}

  end

  it "creates an insight" do

    create_valid_workspace
    wait_until { page.find('a[data-dialog="InsightsNew"]').text == "Add an insight"}
    click_link "Add an insight"
    wait_until { page.find("#facebox .dialog h1").text == "Add an Insight" }
    set_cleditor_value("body", "This is adding an Insight")
    click_submit_button

  end
end

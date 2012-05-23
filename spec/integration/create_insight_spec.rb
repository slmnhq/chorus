require File.join(File.dirname(__FILE__), 'spec_helper')

describe "creating a note on a workspace" do
  before(:each) do
    login('edcadmin', 'secret')
    create_valid_workspace
    wait_until { page.find('a[data-dialog="InsightsNew"]').text == "Add an insight"}
    click_link "Add an insight"
    wait_until { page.find("#facebox .dialog h1").text == "Add an Insight" }
  end
  it "creates an insight" do
    set_cleditor_value("body", "This is adding an Insight")
    find(".submit").click
  end
end

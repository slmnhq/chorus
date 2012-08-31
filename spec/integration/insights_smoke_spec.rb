require File.join(File.dirname(__FILE__), 'spec_helper')

describe "Insights" do

  xit "clicks on the insights link on the home page" do
    login('edcadmin', 'secret')
    wait_for_ajax
    click_link "Insights"
    wait_for_ajax
    wait_until {page.find(".title h1").text == "Insights"}
  end

  xit "creates an insight" do
    login('edcadmin', 'secret')
    create_valid_workspace
    wait_until { page.find('a[data-dialog="InsightsNew"]').text == "Add an insight"}
    click_link "Add an insight"

    within_modal do
      set_cleditor_value("body", "This is adding an Insight")
      click_submit_button
    end
  end
end

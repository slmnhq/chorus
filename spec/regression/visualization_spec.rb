require File.join(File.dirname(__FILE__), '../integration/spec_helper')

#These tests actually create the charts from the instances view. Need to write separate tests for visulaization from sandbox

describe "Create frequency plot" do

  it "creates frequency plot" do

    login('edcadmin','secret')
    create_gpdb_instance(:name => "frequency_plot")
    wait_for_ajax
    click_link "frequency_plot"
    wait_for_ajax
    click_link "ChorusAnalytics"
    wait_for_ajax
    click_link "analytics"
    wait_for_ajax
    click_link "2009_sfo_customer_survey"
    wait_for_ajax
    click_button "Visualize"

    click_button "Create Chart"
    within_modal do
      page.should have_content "Visualization: 2009_sfo_customer_survey"
      click_link "Show Data Table"
      page.should have_content "Results Console"
      click_link "Hide Data Table"
      click_button "Close"
    end

  end

end

describe "User can cancel a visualization" do

  it "creates frequency plot" do

    login('edcadmin','secret')
    create_gpdb_instance(:name => "cancel_visualization")
    wait_for_ajax
    click_link "frequency_plot"
    wait_for_ajax
    click_link "ChorusAnalytics"
    wait_for_ajax
    click_link "analytics"
    wait_for_ajax
    click_link "2009_sfo_customer_survey"
    wait_for_ajax
    click_button "Visualize"

    click_button "Create Chart"
    click_button "Cancel"

  end

end
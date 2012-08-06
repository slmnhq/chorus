require File.join(File.dirname(__FILE__), 'spec_helper')

#These tests actually create the charts from the instances view. Need to write separate tests for visulaization from sandbox

describe "Create frequency plot" do

  it "creates frequency plot" do

    login('edcadmin','secret')
    create_gpdb_instance(:name => "frequency_plot")
    click_link "frequency_plot"
    wait_for_ajax
    click_link "ChorusAnalytics"
    sleep(2)
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

describe "Create box plot" do

  it "creates box" do

    login('edcadmin','secret')
    create_gpdb_instance(:name => "boxplot")
    wait_for_ajax
    click_link "boxplot"
    wait_for_ajax
    click_link "ChorusAnalytics"
    sleep(2)
    click_link "analytics"
    wait_for_ajax
    click_link "campaign_dim"
    wait_for_ajax
    click_button "Visualize"
    find(".chart_icon.boxplot").click

    click_button "Create Chart"
    within_modal do
      page.should have_content "Visualization: campaign_dim"
      click_link "Show Data Table"
      page.should have_content "Results Console"
      click_link "Hide Data Table"
      click_button "Close"
    end

  end

end

describe "Create time series plot" do

  it "creates time series" do

    login('edcadmin','secret')
    create_gpdb_instance(:name => "time_series")
    wait_for_ajax
    click_link "time_series"
    wait_for_ajax
    click_link "ChorusAnalytics"
    sleep(2)
    click_link "analytics"
    wait_for_ajax
    click_link "campaign_dim"
    wait_for_ajax
    click_button "Visualize"
    find(".chart_icon.timeseries").click

    click_button "Create Chart"
    within_modal do
      page.should have_content "Visualization: campaign_dim"
      click_link "Show Data Table"
      page.should have_content "Results Console"
      click_link "Hide Data Table"
      click_button "Close"
    end

  end

end

describe "Create heat map plot" do

  it "creates heat map" do

    login('edcadmin','secret')
    create_gpdb_instance(:name => "heatmap_plot")
    wait_for_ajax
    click_link "heatmap_plot"
    wait_for_ajax
    click_link "ChorusAnalytics"
    sleep(2)
    click_link "analytics"
    wait_for_ajax
    click_link "2009_sfo_customer_survey"
    wait_for_ajax
    click_button "Visualize"
    find(".chart_icon.heatmap").click

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


describe "Create histogram plot" do

  it "creates histogram plot" do

    login('edcadmin','secret')
    create_gpdb_instance(:name => "histogram_plot")
    wait_for_ajax
    click_link "histogram_plot"
    wait_for_ajax
    click_link "ChorusAnalytics"
    sleep(2)
    click_link "analytics"
    wait_for_ajax
    click_link "2009_sfo_customer_survey"
    wait_for_ajax
    click_button "Visualize"
    find(".chart_icon.histogram").click

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

  xit "cancels visualization" do

    login('edcadmin','secret')
    create_gpdb_instance(:name => "cancel_visualization")
    wait_for_ajax
    click_link "cancel_visualization"
    wait_for_ajax
    click_link "ChorusAnalytics"
    sleep(2)
    click_link "analytics"
    wait_for_ajax
    click_link "2009_sfo_customer_survey"
    wait_for_ajax
    click_button "Visualize"

    click_button "Create Chart"
    click_button "Cancel"

  end

end
require File.join(File.dirname(__FILE__), 'spec_helper')

#These tests actually create the charts from the instances view. Need to write separate tests for visulaization from sandbox

describe "Visualizations" do
  let(:instance) { GpdbIntegration.real_gpdb_instance }
  before do
    login(users(:admin))
  end

  describe "Create frequency plot" do
    it "creates frequency plot" do
      visit("#/instances")
      wait_for_ajax
      click_link instance.name
      wait_for_ajax
      click_link "ChorusAnalytics"
      wait_for_ajax(60)
      click_link "analytics"
      wait_for_ajax
      click_link "2009_sfo_customer_survey"
      wait_for_ajax
      click_button "Visualize"
      click_button "Create Chart"
      wait_for_ajax

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
      visit("#/instances")
      wait_for_ajax
      click_link instance.name
      wait_for_ajax
      click_link "ChorusAnalytics"
      wait_for_ajax(60)
      click_link "analytics"
      wait_for_ajax
      click_link "campaign_dim"
      wait_for_ajax
      click_button "Visualize"
      find(".chart_icon.boxplot").click
      click_button "Create Chart"
      wait_for_ajax

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
      visit("#/instances")
      wait_for_ajax
      click_link instance.name
      wait_for_ajax
      click_link "ChorusAnalytics"
      wait_for_ajax(60)
      click_link "analytics"
      wait_for_ajax
      click_link "campaign_dim_stage"
      wait_for_ajax
      click_button "Visualize"
      find(".chart_icon.timeseries").click
      click_button "Create Chart"
      wait_for_ajax

      within_modal do
        page.should have_content "Visualization: campaign_dim_stage"
        click_link "Show Data Table"
        page.should have_content "Results Console"
        click_link "Hide Data Table"
        click_button "Close"
      end
    end
  end

  describe "Create heat map plot" do
    it "creates heat map" do
      visit("#/instances")
      wait_for_ajax
      click_link instance.name
      wait_for_ajax
      click_link "ChorusAnalytics"
      wait_for_ajax(60)
      click_link "analytics"
      wait_for_ajax
      click_link "2009_sfo_customer_survey"
      wait_for_ajax
      click_button "Visualize"
      find(".chart_icon.heatmap").click
      click_button "Create Chart"
      wait_for_ajax

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
      wait_for_ajax
      click_link instance.name
      wait_for_ajax
      click_link "ChorusAnalytics"
      wait_for_ajax(60)
      click_link "analytics"
      wait_for_ajax
      click_link "2009_sfo_customer_survey"
      wait_for_ajax
      click_button "Visualize"
      find(".chart_icon.histogram").click
      click_button "Create Chart"
      wait_for_ajax

      within_modal do
        page.should have_content "Visualization: 2009_sfo_customer_survey"
        click_link "Show Data Table"
        page.should have_content "Results Console"
        click_link "Hide Data Table"
        click_button "Close"
      end
    end
  end
end
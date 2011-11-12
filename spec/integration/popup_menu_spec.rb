require File.join(File.dirname(__FILE__), 'spec_helper')

describe "popup menus" do
  it "pops up a menu" do
    login('edcadmin', 'secret')
    page.find(".menu").should_not be_visible
    page.find(".header .username a").click
    page.find(".menu").should be_visible
    page.find(".header .username a").click
    page.find(".menu").should_not be_visible
  end
end
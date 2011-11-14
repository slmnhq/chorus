require File.join(File.dirname(__FILE__), 'spec_helper')

describe "popup menus - username" do
  it "pops up the right menu" do
    login('edcadmin', 'secret')
    page.find(".menu.popup_username").should_not be_visible

    page.find(".header .username a").click
    page.find(".menu.popup_username").should be_visible
    page.find(".menu.popup_account").should_not be_visible

    page.find(".header .username a").click
    page.find(".menu.popup_username").should_not be_visible
  end
end
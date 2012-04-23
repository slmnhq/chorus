require File.join(File.dirname(__FILE__), 'spec_helper')

describe "logging out" do
  it "can log out" do
    login('edcadmin', 'secret')
    page.find(".header .username a").click
    page.find('.menu.popup_username a[href="#/logout"]').click
    wait_until { current_route == "/login" }
  end
end

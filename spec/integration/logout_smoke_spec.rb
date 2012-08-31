require File.join(File.dirname(__FILE__), 'spec_helper')

describe "Logout" do
  it "logs the user out" do
    login(users(:admin))
    page.find(WEBPATH['user_menu']['menu']).click
    page.find(WEBPATH['user_menu']['signout']).click
    wait_for_ajax
    current_route.should == "/login"
  end
end

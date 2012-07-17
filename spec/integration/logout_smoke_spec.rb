require File.join(File.dirname(__FILE__), 'spec_helper')

adminlogin = WEBPATH['admin']['login']
adminpassword = WEBPATH['admin']['password']

describe "logging out" do
  it "can log out" do
    login(adminlogin, adminpassword)
    page.find(WEBPATH['user_menu']['menu']).click
    page.find(WEBPATH['user_menu']['signout']).click
    wait_until { current_route == "/login" }
  end
end

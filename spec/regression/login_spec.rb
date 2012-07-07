require File.join(File.dirname(__FILE__), '../integration/spec_helper')

adminlogin = WEBPATH['admin']['login']
adminpassword = WEBPATH['admin']['password']

describe "logging in" do
  it "handles bad login" do
    login(adminlogin, 'bogus')
    wait_until { current_route == "/login" }
  end
end
require File.join(File.dirname(__FILE__), 'spec_helper')

adminlogin = WEBPATH['admin']['login']
adminpassword = WEBPATH['admin']['password']

describe "logging in" do
  it "logs in" do
    login(adminlogin, adminpassword)
    current_route.should == "/"
  end

  it "handles bad login" do
    login(adminlogin, 'bogus')
    current_route.should == "/login"
  end
end
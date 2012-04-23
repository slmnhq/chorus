require File.join(File.dirname(__FILE__), 'spec_helper')

describe "logging in" do
  it "logs in" do
    login('edcadmin', 'secret')
    current_route.should == "/"
  end

  it "handles bad login" do
    login('edcadmin', 'bogus')
    current_route.should == "/login"
  end
end
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

  it "logs the user out after two hours" do
    login(adminlogin, adminpassword)
    create_valid_workspace(:name => "FooWorkspace")
    wait_until { page.find('a[data-dialog="WorkspaceSettings"]').text == "Edit Workspace"}
    Timecop.travel(Time.current + 3.hours) do
      click_link "Home"
      wait_until { page.find("input#username").present? }
      current_route.should == "/login"
      login(adminlogin, adminpassword)
      click_link("FooWorkspace")
      wait_until { page.find('a[data-dialog="WorkspaceSettings"]').text == "Edit Workspace"}
      Timecop.travel(Time.current + 6.hours) do
        click_link("Home")
        wait_until { page.find("input#username").present? }
        current_route.should == "/login"
      end
    end

  end
end
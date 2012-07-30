require File.join(File.dirname(__FILE__), 'spec_helper')

adminlogin = WEBPATH['admin']['login']
adminpassword = WEBPATH['admin']['password']

describe "logging in" do
  it "logs in" do
    login(adminlogin, adminpassword)
    current_route.should == "/"
  end

  it "logs the user out after two hours" do
    login(adminlogin, adminpassword)
    create_valid_workspace(:name => "FooWorkspace")

    Timecop.travel(Time.current + 3.hours) do
      wait_for_ajax
      # Sometimes an AJAX may trigger the redirection before
      # and thus the link does not exist
      page.has_css?("a:contains('Home')") && click_link("Home")

      wait_until { current_route == "/login" }
      wait_for_ajax
      login(adminlogin, adminpassword)

      click_link("FooWorkspace")
      wait_for_ajax

      Timecop.travel(Time.current + 6.hours) do
        # Sometimes an AJAX may trigger the redirection before
        # and thus the link does not exist
        page.has_css?("a:contains('Home')") && click_link("Home")

        wait_until { current_route == "/login" }
      end
    end
  end
end

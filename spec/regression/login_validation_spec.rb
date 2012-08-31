require File.join(File.dirname(__FILE__), 'spec_helper')

describe "validation errors" do
  before do
    login('edcadmin', '')
  end
  it "should have the has_error class" do
     field_errors.should_not be_empty
  end
  it "should have a float on focus" do
     page.execute_script('$("#password").trigger("focus")')
     wait_until { page.find(".ui-tooltip-focus[aria-hidden=false]") }
  end
  it "should have a float on mouseover" do
     page.execute_script('$("#password").trigger("mouseover")')
     wait_until {page.find(".ui-tooltip-focus[aria-hidden=false]") }
  end
end

describe "trying different login methods" do

  it "should not allow you to login with a wrong username and password" do
    login('edcadmins', 'secrets')
    page.should have_content "Username or password is invalid"

    login('admin', 'secret')
    page.should have_content "Username or password is invalid"


    login('edcadmin', 'secrets')
    page.should have_content "Username or password is invalid"

    login('edcadmin', 'secret')
    page.should have_content "Recent Activity"
  end

end

describe "displays the version and the SHA info on the login page" do

  it "displays the version and sha version" do

    go_to_login_page
    page.should have_content "Version 2.2."
    page.should have_content "EMC2, EMC, Greenplum, Greenplum Chorus, and the EMC logo are registered trademarks or trademarks of EMC Corporation in the United States and other countries. All other trademarks used herein are the property of their respective owners."
    page.should have_content "This software is protected, without limitation, by copyright law and international treaties. Use of this software and the intellectual property contained therein is expressly limited to the terms and conditions of the License Agreement under which it is provided by or on behalf of EMC."

  end

end

describe "popup menus - username" do
  it "pops up the right menu" do
    login('edcadmin', 'secret')
    page.find(".menu.popup_username").should_not be_visible

    page.find(".header .username a").click
    page.find(".menu.popup_username").should be_visible

    page.find(".header .username a").click
    page.find(".menu.popup_username").should_not be_visible
  end
end
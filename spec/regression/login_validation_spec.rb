require File.join(File.dirname(__FILE__), '../integration/spec_helper')

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
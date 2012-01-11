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
     sleep 0.5
     page.find(".ui-tooltip-focus").should be_visible
  end
  it "should have a float on mouseover" do
     page.execute_script('$("#password").trigger("mouseover")')
     sleep 0.5
     page.find(".ui-tooltip-focus").should be_visible
  end
end
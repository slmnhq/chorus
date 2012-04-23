require File.join(File.dirname(__FILE__), 'spec_helper')

describe "deleting a workspace" do
  before(:each) do
    login('edcadmin', 'secret')
    create_valid_workspace
  end
  it "deletes the workspace" do
    click_link "Delete this Workspace"
    wait_until { page.has_selector?(".submit") }
    find(".submit").click
  end
end


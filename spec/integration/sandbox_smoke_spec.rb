require File.join(File.dirname(__FILE__), 'spec_helper')

describe "Create Sandbox" do
  before(:each) do
    login('edcadmin', 'secret')
  end

  xit "creates sandbox in private workspace" do
    go_to_workspace_page
    create_valid_workspace(:name => "Private Workspace", :shared => false)
    fill_in 'name', :with => "Private Workspace"
    uncheck ("Make this workspace publicly available")
    create_valid_user(:username => "private")
    login('private','secret')
    go_to_workspace_page
    page.should_not have_content ("Private Workspace")
  end

  xit "creates sandbox in public workspace" do
    create_valid_workspace
  end
end


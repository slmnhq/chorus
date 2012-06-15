require File.join(File.dirname(__FILE__), 'spec_helper')

describe "Create workspaces" do
  before(:each) do
    login('edcadmin', 'secret')
  end

  it "creates a valid workspace public workspace" do
    create_valid_workspace(:name => "valid_workspace")
  end

  it "creates a workspace with numbers" do
    create_valid_workspace(:name => "numbers_123")
  end

  it "creates a workspace with special characters" do
    create_valid_workspace(:name => "spl_char_!@##%^&&*()}{|?><:;|")
  end

  it "creates a workspace with special characters" do
      create_valid_workspace(:name => "123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456")
    end
  it "creates a private workspace" do

    go_to_workspace_page
    click_button "Create Workspace"
    fill_in 'name', :with => "Private Workspace"
    uncheck ("Make this workspace publicly available")
    create_valid_user(:username => "private")
    login('private','secret')
    go_to_workspace_page
    page.should_not have_content ("Private Workspace")
  end
end
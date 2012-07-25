require File.join(File.dirname(__FILE__), 'spec_helper')

describe "Create Sandbox" do
  before(:each) do
    login('edcadmin', 'secret')
  end

  it "creates sandbox in private workspace" do
    go_to_workspace_page
    create_gpdb_instance(:name => "Gillette")
    create_valid_workspace(:name => "Private Workspace", :shared => false)
    #Sandbox
    click_link "Add a sandbox"
    page.execute_script %( $("select[name='instance'").selectmenu("value", "1"); )
    sleep(10)
    #page.mouseDown('div.instance div.select_container span a span.ui-selectmenu-status')
    #page.select(1, 'div.instance div.select_container span a span.ui-selectmenu-status')

    #page.execute_script('.ui-selectmenu-open a:contains(gillette)')
  end

  xit "creates sandbox in public workspace" do
    create_valid_workspace
  end
end


require File.join(File.dirname(__FILE__), 'spec_helper')

describe "copy a workfile" do
  before(:each) { login('edcadmin', 'secret') }

  it "copies the file to another workspace" do
    create_valid_workspace(:name => "sourceworkspace")
    source_workspace_id = Workspace.find_by_name("sourceworkspace").id

    click_link "Work Files"
    page.find("h1").should have_content("Work Files")
    wait_for_ajax
    click_button "Create SQL File"

    within_modal do
      fill_in 'fileName', :with => "workfile"
      click_button "Add SQL File"
      wait_for_ajax
    end
    workfile_id = Workfile.find_by_file_name("workfile.sql").id

    create_valid_workspace(:name => "targetworkspace")
    target_workspace_id = Workspace.find_by_name("targetworkspace").id
    visit("#/workspaces/#{source_workspace_id}/quickstart")
    wait_for_ajax
    click_link "Work Files"
    wait_until { current_route =~ /workspaces\/\d+\/workfiles/ }
    within(".workfile_list") do
      page.find("li[data-id='#{workfile_id}']").click
    end

    2.times do
      click_link "Copy latest version to another workspace"
      within(".collection_list") do
        page.find("li[data-id='#{target_workspace_id}']").click
      end
      click_button "Copy File"
      wait_for_ajax
    end

    visit("#/workspaces/#{target_workspace_id}/quickstart")
    wait_for_ajax
    click_link "Work Files"
    wait_for_ajax
    workfiles = page.all("li.workfile")
    workfiles.first.text.should == "workfile.sql"
    workfiles.last.text.should == "workfile_1.sql"
  end
end

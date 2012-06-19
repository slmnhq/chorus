require File.join(File.dirname(__FILE__), 'spec_helper')

describe "save as Menu" do
  it "download the workfile" do
    pending "how to test file download in selenium?"

    login('edcadmin', 'secret')
    visit("#/workspaces")
    wait_until { current_route == '/workspaces' && page.has_selector?("button[data-dialog=WorkspacesNew]") }

    click_button "Create Workspace"
    within("#facebox") do
      fill_in 'name', :with => "partyman#{Time.now.to_i}"
      click_button "Create Workspace"
    end
    wait_until { current_route =~ /workspaces\/\d+/ }

    click_link "Work Files"
    wait_until { current_route =~ /workspaces\/\d+\/workfiles/ }

    click_button "Create SQL File"
    @file_name = "wicked_data#{Time.now.to_i}"
    fill_in 'fileName', :with => @file_name
    click_button "Add SQL File"
    wait_until { current_route =~ /workspaces\/\d+\/workfiles\/\d+/ }
    wait_until {
      !!evaluate_script('chorus.page.mainContent && chorus.page.mainContent.content && chorus.page.mainContent.content.textContent && chorus.page.mainContent.content.textContent.editor && !!chorus.page.mainContent.content.textContent.editor.setValue')
    }

    page.find(".save_options .save_as_new").should_not be_visible
    page.find(".save_options .save_as_current").should_not be_visible
    page.find(".save .save_as").click
    wait_until { page.find(".qtip[aria-hidden=false]") }

    click_link 'Download'
    page.response_headers['Content-Disposition'].should_not be_blank
  end
end

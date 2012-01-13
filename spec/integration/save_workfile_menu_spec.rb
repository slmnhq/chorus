require File.join(File.dirname(__FILE__), 'spec_helper')

describe "save as Menu" do
  before do
    login('edcadmin', 'secret')
    visit("#/workspaces")

    click_button "Create Workspace"
    within("#facebox") do
      fill_in 'name', :with => "partyman#{Time.now.to_i}"
      click_button "Create Workspace"
    end
    wait_until { current_route =~ /workspaces\/\d+/ }

    click_link "Work Files"
    wait_until { current_route =~ /workspaces\/\d+\/workfiles/ }

    click_button "Create SQL File"
    fill_in 'fileName', :with => "wicked_data#{Time.now.to_i}"
    click_button "Add SQL File"
    wait_until { current_route =~ /workspaces\/\d+\/workfiles\/\d+/ }
    wait_until {
        !!evaluate_script('chorus.page.mainContent && chorus.page.mainContent.content && chorus.page.mainContent.content.editor && !!chorus.page.mainContent.content.editor.setValue')
    }
  end

  it "pops up the right menu" do
    page.find(".save_options .save_as_new").should_not be_visible
    page.find(".save_options .save_as_current").should_not be_visible
    page.find(".save .save_as").click
    wait_until { page.find(".qtip[aria-hidden=false]") }
    page.find("a.save_as_new").should be_visible
    page.find("a.save_as_current").should be_visible
  end

  it "click the save as replace version" do
    page.execute_script('chorus.page.mainContent.content.editor.setValue("new Blood")')
    page.find(".save .save_as").click
    wait_until { page.find(".qtip[aria-hidden=false]") }
    page.find("a.save_as_current").click
    wait_until { page.find(".qtip[aria-hidden=true]") }
    page.find("textarea.text_editor").should have_content('new Blood')
  end

  it "click the save as new  version" do
    page.execute_script('chorus.page.mainContent.content.editor.setValue("new Blood -2")')
    page.find(".save .save_as").click
    wait_until { page.find(".qtip[aria-hidden=false]") }
    page.find("a.save_as_new").click
    wait_until { page.find(".qtip[aria-hidden=true]") }
    fill_in 'commitMessage', :with => "commit Message -2"
    click_button "Save New Version"
    wait_until { current_route =~ /workspaces\/\d+\/workfiles\/\d+/ }
    page.find("textarea.text_editor").should have_content('new Blood -2')
  end
end

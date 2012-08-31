require File.join(File.dirname(__FILE__), 'spec_helper')

#This file has different actions that can be performed on workfile. The tests include
#copying a workfile to another workspace
#Saving as Draft
#Saving as a New Version

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
    workfiles.map(&:text).should =~ ["workfile.sql", "workfile_1.sql"]
  end
end

describe "Workfile drafts" do
  def wait_for_text_element
    wait_until do
      !!evaluate_script('chorus.page.mainContent && chorus.page.mainContent.content && chorus.page.mainContent.content.textContent && chorus.page.mainContent.content.textContent.editor && !!chorus.page.mainContent.content.textContent.editor.setValue')
    end
  end

  before :each do
    login('edcadmin', 'secret')
    visit("#/workspaces")
    wait_until { current_route == '/workspaces' && page.has_selector?("button[data-dialog=WorkspacesNew]") }

    click_button "Create Workspace"
    within_modal do
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
    wait_for_text_element
  end

  it "should open the text editor for the draft" do
    page.execute_script('chorus.page.mainContent.content.textContent.editor.setValue("new Blood -1")')
    click_link "Work Files"
    wait_until { current_route =~ /workspaces\/\d+\/workfiles/ }
    click_link @file_name
    wait_until { current_route =~ /workspaces\/\d+\/workfiles\/\d+/ }
    within_modal do
      click_button 'Open Draft'
    end
    wait_until { current_route =~ /workspaces\/\d+\/workfiles\/\d+/ }
    page.find("textarea.text_editor").should have_content('new Blood -1')
  end

  it "content should be of last version" do
    wait_for_text_element
    page.execute_script('chorus.page.mainContent.content.textContent.editor.setValue("new Blood")')
    page.find(".save .save_file_as").click
    wait_until { page.find(".qtip[aria-hidden=false]") }
    page.find("a[data-menu-name=replace]").click
    wait_until { page.find(".qtip[aria-hidden=true]") }
    page.find("textarea.text_editor").should have_content('new Blood')
    click_link "Work Files"
    click_link @file_name
    wait_until { current_route =~ /workspaces\/\d+\/workfiles\/\d+/ }
    wait_for_text_element
    page.execute_script('chorus.page.mainContent.content.textContent.editor.setValue("new Blood -1")')
    click_link "Work Files"
    wait_until { current_route =~ /workspaces\/\d+\/workfiles/ }
    click_link @file_name
    wait_until { current_route =~ /workspaces\/\d+\/workfiles\/\d+/ }
    click_button 'Open Saved Version'
    wait_until { current_route =~ /workspaces\/\d+\/workfiles\/\d+/ }
    page.find("textarea.text_editor").should have_content('new Blood')
  end
end

describe "save as Menu" do
  before do
    login('edcadmin', 'secret')
    visit("#/workspaces")
    wait_until { current_route == '/workspaces' && page.has_selector?("button[data-dialog=WorkspacesNew]") }

    click_button "Create Workspace"
    within_modal do
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
  end

  it "saves the file" do
    #replacing current version
    page.execute_script('chorus.page.mainContent.content.textContent.editor.setValue("new Blood")')
    page.should have_no_css(".components_menu a[data-menu-name='new']")
    page.should have_no_css(".components_menu a[data-menu-name='replace']")
    page.find(".save .save_file_as").click
    wait_until { page.find(".qtip[aria-hidden=false]") }
    page.find(".components_menu a[data-menu-name='new']").should be_visible
    page.find(".components_menu a[data-menu-name='replace']").click
    wait_until { page.find(".qtip[aria-hidden=true]") }
    page.find("textarea.text_editor").should have_content('new Blood')
    click_link "Work Files"
    wait_until { current_route =~ /workspaces\/\d+\/workfiles/ }
    click_link @file_name
    wait_until { current_route =~ /workspaces\/\d+\/workfiles\/\d+/ }
    page.find("textarea.text_editor").should have_content('new Blood')

    #saving as new version
    page.execute_script('chorus.page.mainContent.content.textContent.editor.setValue("new Blood -2")')
    page.find(".save .save_file_as").click
    wait_until { page.find(".qtip[aria-hidden=false]") }
    page.find(".components_menu a[data-menu-name='new']").click
    wait_until { page.find(".qtip[aria-hidden=true]") }
    fill_in 'commitMessage', :with => "commit Message -2"
    click_button "Save New Version"
    wait_until { current_route =~ /workspaces\/\d+\/workfiles\/\d+/ }
    page.find("textarea.text_editor").should have_content('new Blood -2')

  end

  it "open the specific version" do
    page.execute_script('chorus.page.mainContent.content.textContent.editor.setValue("new Blood")')
    page.find(".save .save_file_as").click
    wait_until { page.find(".qtip[aria-hidden=false]") }
    page.find("a[data-menu-name=replace]").click
    wait_until { page.find(".qtip[aria-hidden=true]") }
    wait_until { current_route =~ /workspaces\/\d+\/workfiles\/\d+/ }

    page.execute_script('chorus.page.mainContent.content.textContent.editor.setValue("new Blood -2")')
    page.find(".save .save_file_as").click
    wait_until { page.find("a[data-menu-name='new']") }
    wait_for_ajax
    page.find(".components_menu a[data-menu-name='new']").click
    wait_until { page.find(".qtip[aria-hidden=true]") }
    fill_in 'commitMessage', :with => "commit Message -2"
    click_button "Save New Version"
    wait_for_ajax
    wait_until { current_route =~ /workspaces\/\d+\/workfiles\/\d+/ }
    wait_for_ajax
    page.find("a.version_list").click
    wait_until { page.find(".qtip[aria-hidden=false]") }
    page.find(".workfile_version_list li:last-child a").click
    wait_until { current_route =~ /workspaces\/\d+\/workfiles\/\d+\/versions\/\d+/ }
    page.find("textarea.text_editor").should have_content('new Blood')
  end

end

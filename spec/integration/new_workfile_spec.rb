require File.join(File.dirname(__FILE__), 'spec_helper')

describe " add an instance " do
  before(:each) do
    login('edcadmin', 'secret')
  end

  xit "creates a SQL workfile" do
    visit("#/workspaces")
    wait_until { current_route == '/workspaces' && page.has_selector?("button[data-dialog=WorkspacesNew]") } 
    click_button "Create Workspace"
    within("#facebox") do
      fill_in 'name', :with => "new_sql_wf_ws#{Time.now.to_i}"
      click_button "Create Workspace"    
    end
    wait_until { current_route =~ /workspaces\/\d+/ }
    click_link "Work Files"
    wait_until { current_route =~ /workspaces\/\d+\/workfiles/ }

    click_button "Create SQL File"
    fill_in 'fileName', :with => "new_sql_wf#{Time.now.to_i}"
    click_button "Add SQL File"
    wait_until { current_route =~ /workspaces\/\d+\/workfiles\/\d+/ }
  end

end

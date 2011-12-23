def create_valid_workspace(name=nil)
    name ||= "GinNJuice#{Time.now.to_i}"
    visit("#/workspaces")
    click_button "Create a Workspace"
    fill_in 'name', :with => name
    click_button "Create Workspace"
    wait_until { current_route =~ /workspaces\/\d+/ }
end

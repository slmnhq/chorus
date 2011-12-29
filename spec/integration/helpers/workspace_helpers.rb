def create_valid_workspace(name=nil)
    name ||= "GinNJuice#{Time.now.to_i}"
    visit("#/workspaces")
    click_button "Create Workspace"
    within("#facebox") do
        fill_in 'name', :with => name
        click_button "Create Workspace"
    end
    wait_until { current_route =~ /workspaces\/\d+/ }
end

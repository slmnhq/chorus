def create_valid_workspace(name=nil)
    name ||= "GinNJuice#{Time.now.to_i}"
    visit("#/workspaces")
    wait_until { current_route == "/workspaces" && page.has_selector?("button[data-dialog=WorkspacesNew]") }
    click_button "Create Workspace"
    within("#facebox") do
        fill_in 'name', :with => name
        click_button "Create Workspace"
    end
    wait_until { current_route =~ /workspaces\/\d+/ && page.has_selector?("a[data-dialog=NotesNew]")}
end

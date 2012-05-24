def create_valid_workspace(params = {})
    visit("#/workspaces")
    wait_until { current_route == "/workspaces" && page.has_selector?("button[data-dialog=WorkspacesNew]") }
    click_button "Create Workspace"
    within("#facebox") do
        fill_in 'name', :with => params[:name] || "GinNJuice#{Time.now.to_i}"
        click_button "Create Workspace"
    end
    wait_until { current_route =~ /workspaces\/\d+\/quickstart/ && page.has_selector?("a.dismiss")}
    click_link "Dismiss the workspace quick start guide"
    wait_until { current_route =~ /workspaces\/\d+/ && page.has_selector?("a[data-dialog=NotesNew]")}
end

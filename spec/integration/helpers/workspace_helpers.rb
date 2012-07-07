def create_valid_workspace(params = {})
    visit("#/workspaces")
    click_button "Create Workspace"
    within_modal do
        fill_in 'name', :with => params[:name] || "GinNJuice#{Time.now.to_i}"
        check("public") if params[:shared] == true
        click_button "Create Workspace"
    end
    click_link "Dismiss the workspace quick start guide"
end

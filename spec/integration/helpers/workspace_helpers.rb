def create_valid_workspace(params = {})
    visit("#/workspaces")
    wait_for_ajax
    click_button "Create Workspace"
    within_modal do
        fill_in 'name', :with => params[:name] || "GinNJuice#{Time.now.to_i}"
        check("public") if params[:shared] == true
        click_button "Create Workspace"
    end
    wait_for_ajax
    click_link "Dismiss the workspace quick start guide"
    wait_for_ajax
end

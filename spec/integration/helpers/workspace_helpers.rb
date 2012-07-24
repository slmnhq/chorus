def create_valid_workspace(params = {})
    go_to_workspace_page
    new_workspace_btn
    within_modal do
        fill_in 'name', :with => params[:name] || "GinNJuice#{Time.now.to_i}"
        uncheck ("Make this workspace publicly available") if params[:shared] != true
        click_button "Create Workspace"
    end
    click_link "Dismiss the workspace quick start guide"
end

def new_workspace_btn
    click_button WEBPATH['workspace']['new']
end

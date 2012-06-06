def go_to_workspace_page()
  visit("#/workspaces")
end

def go_to_instance_page()
  visit("#/instances")
end

def go_to_user_list_page()
  visit("#/users")
end

def create_new_user_page()
  visit("/#/users/new")
end


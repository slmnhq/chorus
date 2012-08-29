def go_to_workspace_page
  visit(WEBPATH['workspace']['route'])
end

def go_to_gpdb_instance_page
  visit(WEBPATH['gpdb_instance']['route'])
end

def go_to_user_list_page
  visit(WEBPATH['user']['route'])
end

def create_new_user_page
  visit(WEBPATH['new_user_route'])
end

def go_to_home_page
  visit(WEBPATH['homepage'])
end

def go_to_login_page
  visit(WEBPATH['login_route'])
end
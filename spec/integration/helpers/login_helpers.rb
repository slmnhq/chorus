module LoginHelpers
  def login(username, password)
    visit(WEBPATH['login_route'])
    fill_in 'username', :with => username
    fill_in 'password', :with => password
    click_button "Login"
    wait_until { current_route == '/' || page.all('.has_error').size > 0 || page.all('.errors li').size > 0 }
  end

  def logout
    visit("/#/logout")
  end
end

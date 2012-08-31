module LoginHelpers
  def login(userOrUsername, password = FixtureBuilder.password)
    username = userOrUsername.is_a?(String) ? userOrUsername : userOrUsername.username
    visit(WEBPATH['login_route'])
    wait_for_ajax
    fill_in 'username', :with => username
    fill_in 'password', :with => password
    click_button "Login"
    wait_for_ajax(20)
    wait_until { current_route == '/' || page.all('.has_error').size > 0 || page.all('.errors li').size > 0 }
  end

  def logout
    visit("/#/logout")
  end
end

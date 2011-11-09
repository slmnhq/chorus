module LoginHelpers
  def login(username, password)
    visit("/#/login")
    fill_in 'userName', :with => username
    fill_in 'password', :with => password
    click_button "Login"
    sleep 0.5
  end
end

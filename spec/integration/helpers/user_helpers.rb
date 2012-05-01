def fill_user_form(username)
  fill_in 'first_name', :with => "Joe"
  fill_in 'last_name', :with => "Blow"
  fill_in 'username', :with => username
  fill_in 'emailAddress', :with => "#{username}@blow.com"
  fill_in 'password', :with => "password"
  fill_in 'passwordConfirmation', :with => "password"
end

def click_add_user_button
  page.find("button[type=submit]").click
end

def create_valid_user(username)
  fill_user_form(username)
  click_add_user_button
end


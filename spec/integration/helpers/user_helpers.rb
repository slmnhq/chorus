def fill_user_form(username)
  fill_in 'firstName', :with => "Joe"
  fill_in 'lastName', :with => "Blow"
  fill_in 'username', :with => username
  fill_in 'email', :with => "#{username}@blow.com"
  fill_in 'password', :with => "password"
  fill_in 'passwordConfirmation', :with => "password"
end

def click_submit_button
  page.find("button[type=submit]").click
end

def create_valid_user(username)
  visit("/#/users/new")
  fill_user_form(username)
  click_submit_button
  wait_until { current_route == "/users" }
end

def current_user_id
  evaluate_script "chorus.session.user().id"
end

require File.join(File.dirname(__FILE__), 'spec_helper')

describe "creating a user" do
  before(:each) do
    login('edcadmin', 'secret')
  end

  it "should not create a user whose user id has a white space" do

    create_new_user_page
    first_name = Forgery::Name.first_name
    last_name = Forgery::Name.last_name
    fill_in 'firstName', :with =>first_name
    fill_in 'lastName', :with => last_name
    username = "#{first_name}#{last_name}"
    fill_in 'username', :with => "user name"
    fill_in 'email', :with => "#{username}@email.com"
    fill_in 'password', :with => "secret"
    fill_in 'passwordConfirmation', :with => "secret"
    fill_in 'dept', :with => "Greenplum"
    fill_in 'title', :with => "QA"
    click_submit_button

    page.should have_content ("Username is invalid")
    fill_in 'username', :with => username
    click_submit_button
    wait_until { current_route == "/users" }
    click_link("#{first_name} #{last_name}")
    page.find("div.department").should have_content("Greenplum")
    page.find("div.title").should have_content("QA")
    page.find("h1").should have_content("#{first_name} #{last_name}")

  end

  it "should not let the admin create user without a username" do

    create_new_user_page
    first_name = Forgery::Name.first_name
    last_name = Forgery::Name.last_name
    fill_in 'firstName', :with =>first_name
    fill_in 'lastName', :with => last_name
    username = "#{first_name}#{last_name}"
    fill_in 'username', :with => ""
    fill_in 'email', :with => "#{username}@email.com"
    fill_in 'password', :with => "secret"
    fill_in 'passwordConfirmation', :with => "secret"
    fill_in 'dept', :with => "Greenplum"
    fill_in 'title', :with => "QA"
    click_submit_button
    field_errors.should_not be_empty

    fill_in 'username', :with => username
    click_submit_button
    wait_until { current_route == "/users" }
    click_link("#{first_name} #{last_name}")
    page.find("div.department").should have_content("Greenplum")
    page.find("div.title").should have_content("QA")
    page.find("h1").should have_content("#{first_name} #{last_name}")

  end

  it "should create a user with max length for username field" do

      create_new_user_page
      first_name = Forgery::Name.first_name
      last_name = Forgery::Name.last_name
      fill_in 'firstName', :with =>first_name
      fill_in 'lastName', :with => last_name
      username = "#{first_name}#{last_name}"
      fill_in 'username', :with => "username12username12username12username12username12username12username12username12username12username12username12username12username12username12username12username12username12username12username12username12username12username12username12username12username12123456"
      fill_in 'email', :with => "some@email.com"
      fill_in 'password', :with => "secret"
      fill_in 'passwordConfirmation', :with => "secret"
      fill_in 'dept', :with => "Greenplum"
      fill_in 'title', :with => "QA"
      click_submit_button
      wait_until { current_route == "/users" }
      click_link("#{first_name} #{last_name}")
      page.find("div.department").should have_content("Greenplum")
      page.find("div.title").should have_content("QA")
      page.find("h1").should have_content("#{first_name} #{last_name}")

  end

end
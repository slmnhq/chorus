require File.join(File.dirname(__FILE__), 'spec_helper')

describe "creating a user" do
  before(:each) do
    login('edcadmin', 'secret')
  end

  it "Creates a user and saves their information" do
    visit("/#/users/new")
    wait_for_ajax
    page.find("button[type=submit]").click
    wait_for_ajax
    wait_until { !field_errors.empty? }
    field_errors.should_not be_empty

    first_name = Forgery::Name.first_name
    last_name = Forgery::Name.last_name
    username = "#{first_name}#{last_name}"
    department = Forgery::Name.industry
    title = Forgery::Name.title

    create_valid_user(:username => username, :first_name => first_name, :last_name => last_name,
                       :department => department, :title => title)
    wait_until { current_route == "/users" }
    click_link("#{first_name} #{last_name}")
    page.find("div.department").should have_content(department)
    page.find("div.title").should have_content(title)
    page.find("h1").should have_content("#{first_name} #{last_name}")
  end

  it "should not allow duplicate users" do
    username = Forgery::Name.first_name
    create_valid_user(:username => username)
    visit("/#/users/new")
    field_errors.should be_empty
    fill_user_form(:username => username)
    page.find("button[type=submit]").click
    field_errors.should be_empty
    wait_until { !server_errors.empty? }
  end


  it "should let an admin create a user with a user image" do

    first_name = Forgery::Name.first_name
    last_name = Forgery::Name.last_name
    username = "#{first_name}#{last_name}"
    department = Forgery::Name.industry
    title = Forgery::Name.title

    create_valid_user(:username => username, :first_name => first_name, :last_name => last_name,
                           :department => department, :title => title)
    wait_until { current_route == "/users" }
    click_link("#{first_name} #{last_name}")
    wait_for_ajax
    page.find("h1").should have_content("#{first_name} #{last_name}")

    click_link "Edit Profile"
    attach_file("image_upload_input", File.join(File.dirname(__FILE__), '../fixtures/User.png'))
    click_submit_button

  end
end

describe "changing the password for a user" do
  before(:each) do
    login('edcadmin', 'secret')
  end

  it "allows a user to change the password" do
    create_new_user_page
    first_name = "arianna"
    last_name = "huffington"
    username = "arianna"
    department = Forgery::Name.industry
    title = Forgery::Name.title

    create_valid_user(:username => username, :first_name => first_name, :last_name => last_name,
                      :department => department, :title => title)
    wait_until { current_route == "/users" }
    click_link("#{first_name} #{last_name}")
    page.find("div.department").should have_content(department)
    page.find("div.title").should have_content(title)
    page.find("h1").should have_content("#{first_name} #{last_name}")
    logout

    login('arianna', 'secret')
    visit ("#/users")
    wait_until { current_route == '/users' }
    within(".list") do
      click_link "arianna huffington"
    end
    click_link "Change password"
    page.should have_content("Change Password")

    within_modal do
      fill_in 'password', :with => "secret123"
      fill_in 'passwordConfirmation', :with => "secret123"
      click_button "Change Password"
      wait_for_ajax
    end

    logout
    login('arianna', 'secret123')
    wait_until { current_route == "/" }
  end
end

describe "deleting a user" do
  before(:each) { login('edcadmin', 'secret') }

  it "deletes a user" do
    create_valid_user(:first_name => "Alex", :last_name =>"Reed", :username => "AlexReed")
    click_link "Alex Reed"
    wait_for_ajax
    click_link "Edit Profile"
    wait_for_ajax
    click_link "Delete User"
    click_button "Delete User"
    wait_until { current_route == '/users' }
    page.should_not have_content("Alex Reed")
  end

  it "doesnot delete a user who owns a workspace" do
    create_valid_user(:first_name => "Alex", :last_name =>"Reedy", :username => "AlexReedy")
    as_user("AlexReedy") do
      go_to_workspace_page
      create_valid_workspace()
    end

    as_user("edcadmin") do
      visit("#/users")
      wait_until { current_route == '/users' }
      click_link "Alex Reedy"
      wait_for_ajax
      click_link "Edit Profile"
      wait_for_ajax
      click_link "Delete User"
      click_button "Delete User"
      page.find(".error").should have_content("User cannot be deleted until workspace ownership is transferred to another user")
    end
  end
end

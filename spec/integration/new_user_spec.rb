require File.join(File.dirname(__FILE__), 'spec_helper')

describe "creating a user" do
  before(:each) do
    login('edcadmin', 'secret')
  end

  def fill_user_form(params)
    first_name = Forgery::Name.first_name
    last_name = Forgery::Name.last_name
    username = "#{first_name}#{last_name}"
    fill_in 'firstName', :with => params[:firstName] || first_name
    fill_in 'lastName', :with => params[:lastName] || last_name
    fill_in 'username', :with => params[:username] || username
    fill_in 'email', :with => "#{params[:username]}@email.com" || "#{username}@gmail.com"
    fill_in 'password', :with => "password"
    fill_in 'passwordConfirmation', :with => "password"
    fill_in 'dept', :with => params[:department] ||Forgery::Name.industry
    fill_in 'title', :with => params[:title] ||Forgery::Name.title
  end

  def create_valid_user(params)
    visit("/#/users/new")
    fill_user_form(params)
    page.find("button[type=submit]").click
    wait_until { current_route == "/users" }
  end

  it "Creates a user and saves their information" do
    visit("/#/users/new")
    page.find("button[type=submit]").click
    field_errors.should_not be_empty

    first_name = Forgery::Name.first_name
    last_name = Forgery::Name.last_name
    username = "#{first_name}#{last_name}"
    department = Forgery::Name.industry
    title = Forgery::Name.title

    create_valid_user(:username => username, :firstName => first_name, :lastName => last_name,
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
end

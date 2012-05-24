require File.join(File.dirname(__FILE__), 'spec_helper')

describe "creating a user" do
  before(:each) do
    login('edcadmin', 'secret')
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
end

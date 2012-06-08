require File.join(File.dirname(__FILE__), 'spec_helper')

describe "creating a user" do
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

    within("#facebox") do
      fill_in 'password', :with => "secret123"
      fill_in 'passwordConfirmation', :with => "secret123"
      click_button "Change Password"
    end

    logout
    login('arianna', 'secret123')
    wait_until { current_route == "/" }
  end
end
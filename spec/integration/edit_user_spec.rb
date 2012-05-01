require File.join(File.dirname(__FILE__), 'spec_helper')

describe "editing your own profile" do
  before(:each) do
    login('edcadmin', 'secret')
    visit("/#/users/#{current_user_id}/edit")
  end

  it "displays error messages in a sane way" do
    fill_in "first_name", :with => "james"
    fill_in "last_name", :with => "brown"
    fill_in "email", :with => "fake@example.com"
    click_submit_button

    wait_until { current_route == "/users/#{current_user_id}" }
    find('.content_header').should have_content('james brown')
    find('.content').should have_content('fake@example.com')
  end
end


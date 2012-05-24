require File.join(File.dirname(__FILE__), 'spec_helper')

describe "editing user profiles" do
  describe "editing your own profile" do
    before(:each) do
      login('edcadmin', 'secret')
      visit("/#/users/#{current_user_id}/edit")
    end

    it "can edit a user" do
      fill_in "firstName", :with => "james"
      fill_in "lastName", :with => "brown"
      fill_in "email", :with => "fake@example.com"
      click_submit_button

      wait_until { current_route == "/users/#{current_user_id}" }
      find('.content_header').should have_content('james brown')
      find('.content').should have_content('fake@example.com')
    end
  end

  describe "editing another user's profile" do
    before(:each) do
      login('edcadmin', 'secret')
      create_valid_user(:username => "johnny")
      @new_user_id = User.find_by_username("johnny").id
      visit("/#/users/#{@new_user_id}/edit")
    end

    it "should allow an admin to make another user an admin" do
      page.should have_unchecked_field('admin')
      check "admin"
      click_submit_button
      wait_until { current_route == "/users/#{@new_user_id}"}
      within('.user_info') do
        page.should have_selector('.administrator.tag')
      end
    end
  end
end

require File.join(File.dirname(__FILE__), 'spec_helper')

describe "Users" do
  let(:user) { users(:admin) }
  let(:other_user) { users(:not_a_member) }
  let(:workspace_owner) { users(:no_collaborators) }

  before do
    login(user)
  end

  describe "creating a user" do

    it "Creates a user and saves their information" do
      visit "/#/users/new"
      wait_for_ajax

      fill_in 'firstName', :with => "new"
      fill_in 'lastName', :with => "person"
      fill_in 'username', :with => "new_user"
      fill_in 'email', :with => "new_user@example.com"
      fill_in 'password', :with => "secret"
      fill_in 'passwordConfirmation', :with => "secret"
      click_button "Add This User"
      wait_for_ajax

      click_link("new person")
      page.find("h1").should have_content("new person")
    end

    it "user can upload a user image" do
      visit "#/users"
      wait_for_ajax
      within ".user_list" do
        click_link("#{user.first_name} #{user.last_name}")
      end
      wait_for_ajax

      click_link "Edit Profile"
      attach_file("image_upload_input", File.join(File.dirname(__FILE__), '../fixtures/User.png'))
      click_button "Save Changes"
      wait_for_ajax
      user.reload.image.original_filename.should == 'User.png'
    end
  end

  describe "changing the password for a user" do
    it "allows a user to change the password" do
      visit "#/users"
      wait_for_ajax
      within ".user_list" do
        click_link("#{user.first_name} #{user.last_name}")
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
      login(user, 'secret123')
    end
  end

  describe "deleting a user" do
    it "deletes a user" do
      visit "#/users"
      wait_for_ajax
      within ".user_list" do
        click_link("#{other_user.first_name} #{other_user.last_name}")
      end
      wait_for_ajax
      click_link "Delete User"
      click_button "Delete User"
      wait_for_ajax
      within ".user_list" do
        page.should_not have_content("#{other_user.first_name} #{other_user.last_name}")
      end
    end
  end
end
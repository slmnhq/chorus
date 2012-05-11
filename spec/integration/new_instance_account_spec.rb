require File.join(File.dirname(__FILE__), 'spec_helper')

#TODO will not work until online state of instance is implemented
describe "creating an instance credential" do
  before(:each) do
    login('edcadmin', 'secret')
    create_valid_instance('instance1')
    create_valid_user("testuser1")
  end

  it "works" do
    visit("/#/instances")
    wait_until { current_route == "/instances" && page.has_selector?("a[data-dialog=InstancePermissions]") }
    click_link "Edit"
    within("#facebox") do
      click_button "Add Account"

      #TODO actually select the correct user
      #select('Joe Blow', :from => '#user_name_select')
      fill_in 'db_username', :with => "gpadmin"
      fill_in 'db_password', :with => "secret"
    end

    click_link('Save Changes')
    page.should_not have_selector('.close_errors')
    within('.collection_list') do
      page.should have_content("Joe Blow")
    end
  end
end

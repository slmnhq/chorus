require File.join(File.dirname(__FILE__), 'spec_helper')

describe "creating an instance credential" do
  before(:each) do
    login('edcadmin', 'secret')
  end

  it "creates a new instance account" do
    create_valid_instance
    create_valid_user(:username => "EddyNice", :first_name => "Eddy", :last_name => "Nice")
    user_id = User.find_by_username("EddyNice").id

    visit("/#/instances")
    wait_until { current_route == "/instances" && page.has_selector?("a[data-dialog=InstancePermissions]") }
    click_link "Edit"
    within("#facebox") do
      click_button "Add Account"
      page.execute_script("$('#selectowner').selectmenu('value', #{user_id})")
      fill_in 'dbUsername', :with => "gpadmin"
      fill_in 'dbPassword', :with => "secret"

      click_link('Save Changes')
      page.should_not have_selector('.close_errors')
      within('.collection_list') do
        wait_until { page.has_content?("Eddy Nice") }
        page.should have_content("Eddy Nice")
      end
    end
  end

  it "switches from individual to shared accounts and back" do
    create_valid_instance
    visit("/#/instances")
    wait_until { current_route == "/instances" && page.has_selector?("a[data-dialog=InstancePermissions]") }
    click_link "Edit"
    within("#facebox") do
      click_link "Switch to single shared account"
      click_button "Enable shared account"
      page.should_not have_content "Add Account"
      click_link "Switch to individual accounts"
      click_button "Remove shared account"
      page.should have_content "Add Account"
    end
  end

  it "changes the shared password on a shared instance" do
    create_valid_instance(:shared => true)
    click_link "Edit"
    within("#facebox") do
      click_link "Edit"
      fill_in 'dbUsername', :with => 'gpadmin'
      fill_in 'dbPassword', :with => 'secret2'
      click_link "Save Changes"
      page.find('.errors').should have_content("FATAL: password authentication failed")
      fill_in 'dbPassword', :with => 'secret'
      click_link "Save Changes"
      page.find('.errors').should_not have_content("failed")
    end
  end
end

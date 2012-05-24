require File.join(File.dirname(__FILE__), 'spec_helper')

describe "The workspace add/remove members dialog" do
  it "adds and removes a single member" do
    login('edcadmin', 'secret')

    create_valid_user(:first_name => "Alex", :last_name => "Red")

    alex_id = User.find_by_username("AlexRed").id

    create_valid_workspace
    wait_until { page.find('a[data-dialog="WorkspaceEditMembers"]').text == "Add or Edit Members"}
    click_link "Add or Edit Members"
    wait_until { page.has_selector?("#facebox") && page.find("#facebox .dialog h1").text == "Edit Workspace Members" }

    within("#facebox") do
      within("li[data-id='#{alex_id}']") do
        click_link "Add"
      end
      click_button "Save Changes"
    end

    click_link "Add or Edit Members"

    within("#facebox") do
      within(".shuttle_body") do
        within(".selected") do
          page.should have_content "Alex Red"
          within("li[data-id='#{alex_id}']") do
            click_link "Remove"
          end
        end
      end
      click_button "Save Changes"
    end

    click_link "Add or Edit Members"

    within("#facebox") do
      within(".shuttle_body") do
        within(".available") do
          page.should have_content "Alex Red"
        end
      end
    end
  end
end

require File.join(File.dirname(__FILE__), 'spec_helper')

describe "creating a note on a workspace" do
  before(:each) do
    login('edcadmin', 'secret')
  end

  it "edits workspace settings" do
    create_valid_workspace
    wait_until { page.find('a[data-dialog="WorkspaceSettings"]').text == "Edit Workspace"}
    click_link "Edit Workspace"
    wait_until { page.find("#facebox .dialog h1").text == "Workspace Settings" }

    within("#facebox") do
      fill_in 'name', :with => "change_ws_name#{Time.now.to_i}"
      set_cleditor_value("summary", "Changing the <b>summary</b> <script>foo</script> of the workspace")
      find(".submit").click
    end
    page.find(".styled_text").should have_content "Changing the summary of the workspace"
  end

  it "can change the owner of a workspace" do
    create_valid_user(:first_name => "John", :last_name => "Smith", :username => "JohnSmith")
    user_id = User.find_by_username("JohnSmith").id
    create_valid_workspace(:name => "OwnerChangedWorkspace")
    workspace_id = Workspace.find_by_name("OwnerChangedWorkspace").id

    wait_until { page.find('a[data-dialog="WorkspaceEditMembers"]').text == "Add or Edit Members"}
    click_link "Add or Edit Members"
    wait_until { page.has_selector?("#facebox") && page.find("#facebox .dialog h1").text == "Edit Workspace Members" }

    within("#facebox") do
      within("li[data-id='#{user_id}']") do
        click_link "Add"
      end
      click_button "Save Changes"
    end

    click_link "Edit Workspace"
    wait_until { page.find("#facebox .dialog h1").text == "Workspace Settings" }

    within("#facebox") do
      page.execute_script("$('#selectowner').selectmenu('value', #{user_id})")
      click_button "Save Changes"
    end

    click_link "Edit Workspace"
    wait_until { page.find("#facebox .dialog h1").text == "Workspace Settings" }

    within("#facebox") do
      within('.ui-selectmenu-status') { page.should have_content "John Smith" }
    end

    as_user("JohnSmith") do
      visit("#/workspaces/#{workspace_id}")

      within(".actions") do
        page.should have_content("Add or Edit Members")
        page.should have_content("Add an insight")
        page.should have_content("Add a note")
        page.should have_content("Add a sandbox")
      end

      click_link "Edit Workspace"
      wait_until { page.find("#facebox .dialog h1").text == "Workspace Settings" }
      within("#facebox") do
        choose("workspace_archived")
        find(".submit").click
      end

      page.should_not have_content("Add or Edit Members")
    end
  end

  it "can archive and unarchive the workspace, displaying a localized relative time" do
    workspace_name = "#{Forgery::Name.first_name}'s Workspace'"
    create_valid_workspace(:name => workspace_name)
    click_link "Edit Workspace"
    wait_until { page.find("#facebox .dialog h1").text == "Workspace Settings" }
    within("#facebox") do
      choose("workspace_archived")
      find(".submit").click
    end

    within(".actions") do
      page.should_not have_content("Add or Edit Members")
      page.should_not have_content("Add an insight")
      page.should_not have_content("Add a note")
      page.should_not have_content("Add a sandbox")
    end

    visit('/#/workspaces')
    within(".workspace_list") { page.should_not have_content(workspace_name) }

    page.execute_script("$('.popup').click()")
    wait_until { page.has_content? "All Workspaces" }
    click_link("All Workspaces")
    within(".workspace_list") do
      page.should have_content(workspace_name)
      page.find(".timestamp").text.should == ('Just now')
    end

    click_link(workspace_name)

    click_link "Edit Workspace"
    wait_until { page.find("#facebox .dialog h1").text == "Workspace Settings" }
    within("#facebox") do
      choose("workspace_active")
      find(".submit").click
    end

    within(".actions") do
      page.should have_content("Add or Edit Members")
      page.should have_content("Add an insight")
      page.should have_content("Add a note")
      page.should have_content("Add a sandbox")
    end
  end
end


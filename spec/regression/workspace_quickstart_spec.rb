require File.join(File.dirname(__FILE__), '../integration/spec_helper')

describe "Showing the workspace quickstart page" do
  before(:all) do
    login('edcadmin', 'secret')
    create_valid_user(:first_name => "Mary", :last_name => "Jane", :username => "MaryJane")
    create_valid_user(:first_name => "Peter", :last_name => "Parker", :username => "PeterParker")
    @user_id = User.find_by_username("PeterParker").id

    login('MaryJane', 'secret')

    visit("#/workspaces")
    wait_until { current_route == "/workspaces" && page.has_selector?("button[data-dialog=WorkspacesNew]") }
    click_button "Create Workspace"
    within_modal do
      fill_in 'name', :with => "QuicklyStartedWorkspace"
      click_button "Create Workspace"
    end
    wait_for_ajax
    @workspace_id = Workspace.find_by_name("QuicklyStartedWorkspace").id
  end

  describe "clicking the individual actions" do
    before(:each) do
      login('MaryJane', 'secret')
      visit("#/workspaces/#{@workspace_id}/quickstart") # TODO: this should actually navigate to the show page, to test if the redirect to quickstart works
      wait_until { current_route =~ /workspaces\/\d+\/quickstart/ && page.has_selector?("a.dismiss")}
    end

    it "shows the quickstart page on the first visit to a new workspace" do
      page.should have_selector(".add_team_members")
      page.should_not have_selector(".add_team_members.hidden")

      page.should have_selector(".edit_workspace_settings")
      page.should_not have_selector(".edit_workspace_settings.hidden")

      page.should have_selector(".add_sandbox")
      page.should_not have_selector(".add_sandbox.hidden")

      page.should have_selector(".add_workfiles")
      page.should_not have_selector(".add_workfiles.hidden")
    end

    it "dismisses Dismiss the workspace quick start guidethe Add Team Members box" do
      click_link "Add Team Members"

      within_modal do
        within("li[data-id='#{@user_id}']") do
          click_link "Add"
        end
        click_button "Save Changes"
      end

      wait_until { current_route =~ /workspaces\/\d+\/quickstart/ }
      page.should_not have_selector(".add_team_members")
    end

    it "dismisses Edit Workspace Settings" do
      wait_until { current_route =~ /workspaces\/\d+\/quickstart/ && page.has_selector?("a.dismiss")}
      click_link "Edit Workspace Settings"

      within_modal do
        click_button "Save Changes"
      end

      wait_until { current_route =~ /workspaces\/\d+\/quickstart/ }
      page.should_not have_selector(".edit_workspace_settings")
    end

    # TODO: sandbox is not ready
    xit "dismisses Add a Sandbox (30940889)" do
      click_link "Add a Sandbox"

      within_modal do
        # Once Add a Sandbox has been implemented, this should be changed to Add Sandbox
        click_button "Cancel"
      end

      wait_until { current_route =~ /workspaces\/\d+\/quickstart/ }
      page.should_not have_selector(".add_sandbox")
    end

    # TODO: depending on uploading workfile
    xit "dismisses Add Work Files" do
      click_link "Add Work Files"

      within_modal do
        attach_file "workfile[contents]", "spec/fixtures/workfile.sql"
        click_button "Upload File"
      end

      wait_until { current_route =~ /workspaces\/\d+\/quickstart/ }
      page.should_not have_selector(".add_workfiles")
    end

    # TODO: Need to dismiss all the actions for this test to work
    xit "redirects to the real show page, not quickstart" do
      wait_until { current_route =~ /workspaces\/\d+$/ }
    end
  end

  describe "dismiss workspace quickstart link" do
    before do
      login('MaryJane', 'secret')

      visit("#/workspaces")
      wait_until { current_route == "/workspaces" && page.has_selector?("button[data-dialog=WorkspacesNew]") }
      click_button "Create Workspace"
      within_modal do
        fill_in 'name', :with => "AnotherQuicklyStartedWorkspace"
        click_button "Create Workspace"
      end
    end

    it "dismisses the quickstart" do
      click_link "Dismiss the workspace quick start guide"
      wait_until { current_route =~ /workspaces\/\d+$/ }
    end
  end
end

  describe "choosing a 'desktop file'" do
    let(:file) { Tempfile.new("my_desktop_file_name") }

    before do
      set_cleditor_value("body", "Blood.")
      click_link "Show options"
      attach_file "fileToUpload[]", file.path
    end

    xit "displays the file's name" do
      page.find(".name").should have_content("my_desktop_file_name")
    end

    describe "creating the note with the file" do
      before do
        click_button "Add Note"
      end

      context "when the file is within the size limits" do
        xit "shows the note in the workspace's activity stream" do
          wait_until do
            @note_li = page.find("ul.activities li.activity")
          end
          @note_li.should have_content("Blood.")
          file_link = @note_li.find("ul.attachments a")
          file_link["href"].should include("edc/file")
        end
      end

      context "when the file is too large" do
        let(:file) do
          file = Tempfile.new("my_desktop_file_name")
          file.write("a" * 11_000_000)
          file
        end

        xit "shows a server error" do
          wait_until do
            page.find(".dialog .errors").has_css?("li")
          end
        end
      end
    end
  end



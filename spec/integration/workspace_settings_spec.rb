require File.join(File.dirname(__FILE__), 'spec_helper')

describe "workspace settings dialog" do
    before do
        login('edcadmin', 'secret')
        visit("#/workspaces")

        click_button "Create Workspace"
        within("#facebox") do
            fill_in 'name', :with => "partyman#{Time.now.to_i}"
            click_button "Create Workspace"
        end
        wait_until { current_route =~ /workspaces\/\d+/ }

        click_link "Edit Workspace"
        @dialog = page.find("#facebox .workspace_settings.dialog")
    end

    it "pops up the workspace settings dialog" do
        @dialog.should be_visible
    end

    describe "the WYSIWYG controls for the workspace settings" do
        before do
            wait_until { @toolbar = @dialog.find(".cleditorToolbar") }
        end

        it "shows the correct formatting buttons" do
            @toolbar.should have_selector(".cleditorButton[title='Bold']")
            @toolbar.should have_selector(".cleditorButton[title='Italic']")
            @toolbar.should have_selector(".cleditorButton[title='Bullets']")
            @toolbar.should have_selector(".cleditorButton[title='Numbering']")
            @toolbar.should have_selector(".cleditorButton[title='Insert Hyperlink']")
            @toolbar.should have_selector(".cleditorButton[title='Remove Hyperlink']")

            @toolbar.should_not have_selector(".cleditorButton[title='Underline']")
            @toolbar.should_not have_selector(".cleditorButton[title='Print']")
            @toolbar.should_not have_selector(".cleditorButton[title='Font Color']")
            @toolbar.should_not have_selector(".cleditorButton[title='Align Text Left']")
        end
    end
end

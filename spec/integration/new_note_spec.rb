require File.join(File.dirname(__FILE__), 'spec_helper')
require 'tempfile'

describe "creating a note on a workspace" do
  before(:each) do
    login('edcadmin', 'secret')
    create_valid_workspace
    click_link "Add a note"
  end

  describe "choosing a 'desktop file'" do
      before do
        fill_in "body", :with => "Blood."
        click_link "Show options"
        @file = Tempfile.new("my_desktop_file_name")
        attach_file "fileToUpload", @file.path
      end

      it "displays the file's name" do
          page.find(".file_name").should have_content("my_desktop_file_name")
      end

      describe "creating the note with the file" do
          before do
              click_button "Add Note"
          end

          it "shows the note in the workspace's activity stream" do
              wait_until do
                  @note_li = page.find("ul.activities li.activity")
              end
              @note_li.should have_content("Blood.")
              file_link = @note_li.find("ul.attachments a")
              file_link["href"].should include("edc/file")
          end
      end
  end
end


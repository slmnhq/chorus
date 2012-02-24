require File.join(File.dirname(__FILE__), 'spec_helper')
require 'tempfile'

describe "creating a note on a workspace" do
  before(:each) do
    login('edcadmin', 'secret')
    create_valid_workspace
    click_link "Add a note"
  end

  describe "launching the submodal dialog" do
    before do
      click_link "Show options"
      click_link "Work File"
      wait_until { page.find("#facebox .dialog h1").text == "Attach Work File" }
    end

    it "dismisses each modal with each press of escape" do
      page.find("body").native.send_keys :escape
      wait_until { page.find("#facebox .dialog h1").text == "Add a Note" }
      page.find("body").native.send_keys :escape
      wait_until { !page.has_css?("#facebox") }
    end
  end

  describe "choosing a 'desktop file'" do
      let(:file) { Tempfile.new("my_desktop_file_name") }

      before do
        fill_in "body", :with => "Blood."
        click_link "Show options"
        attach_file "fileToUpload[]", file.path
      end

      it "displays the file's name" do
          page.find(".name").should have_content("my_desktop_file_name")
      end

      describe "creating the note with the file" do
          before do
              click_button "Add Note"
          end

          context "when the file is within the size limits" do
              it "shows the note in the workspace's activity stream" do
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

              it "shows a server error" do
                  wait_until do
                      page.find(".dialog .errors").has_css?("li")
                  end
              end
          end
      end
  end
end


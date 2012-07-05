require File.join(File.dirname(__FILE__), 'spec_helper')

describe "creating a note on an instance" do
  it "contains the new note" do
    login('edcadmin', 'secret')
    new_instance_name = "GPDB_inst_sel_test#{Time.now.to_i}"
    create_gpdb_gillette_instance(:name => new_instance_name)
    wait_until { page.has_selector?('a[data-dialog="NotesNew"]') }
    sleep(1)
    click_link "Add a note"

    within_modal do
      set_cleditor_value("body", "Note on the instance")
      click_submit_button
      wait_for_ajax
    end

    page.find(".activity_content").should have_content("Note on the instance")
  end
end

describe "creating a note on a workspace" do
  before(:each) do
    login('edcadmin', 'secret')
    create_valid_workspace
    wait_until { page.has_selector?('a[data-dialog="NotesNew"]') }
    sleep(1)
    click_link "Add a note"
    wait_until { page.has_selector?("#facebox .dialog h1") }
  end

  xit "dismisses each modal with each press of escape" do
    click_link "Show options"
    wait_until { page.has_selector?("#facebox .dialog span.label") }
    click_link "Work File"
    wait_until { page.has_selector?("#facebox .dialog h1") }

    page.find("body").native.send_keys :escape
    wait_until { page.has_selector?("#facebox .dialog h1") }
    page.find("body").native.send_keys :escape
    evaluate_script('$("#facebox").length').should be_zero
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
end


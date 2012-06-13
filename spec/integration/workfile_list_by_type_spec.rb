require File.join(File.dirname(__FILE__), 'spec_helper')

describe "creating a note on a workspace" do
  before(:each) do
    login('edcadmin', 'secret')

  end

  it "creates and displays a text workfile using file sort" do
      create_valid_workspace(:name => "textfilesort")
      wait_until { page.find('a[data-dialog="WorkspaceSettings"]').text == "Edit Workspace"}
      click_link("Work Files")
      click_button("Upload File")
      sleep(2)
      within("#facebox") do
        attach_file("workfile[contents]", File.join(File.dirname(__FILE__), '../fixtures/some.txt'))
        click_button("Upload File")
      end
      wait_until { current_route =~ /workspaces\/\d+\/workfiles\/\d+/ }
      within(".text_workfile_content") do
        page.should have_content("hello")
      end
      click_link "Work Files"
      sleep(1)
      click_link("All files")
      click_link("Text files")
      within(".workfile_list") do
        page.should have_content("some.txt")
      end
    end

    it "creates and lists sql workfiles" do
      create_valid_workspace ({:name => "sqllisting"})
      wait_until { page.find('a[data-dialog="WorkspaceSettings"]').text == "Edit Workspace"}
      create_valid_workfile ({:name => "listingsql"})
      click_link "Work Files"
      sleep(1)
      click_link("All files")
      click_link("SQL files")
      within(".workfile_list") do
        page.should have_content("listingsql.sql")
      end
    end

    it "creates and lists img workfiles" do
      create_valid_workspace(:name => "imagesort")
      wait_until { page.find('a[data-dialog="WorkspaceSettings"]').text == "Edit Workspace"}
      click_link("Work Files")
      click_button("Upload File")
      within("#facebox") do
        attach_file("workfile[contents]", File.join(File.dirname(__FILE__), '../fixtures/small2.png'))
        click_button("Upload File")
        sleep(2)
      end

      wait_until { current_route =~ /workspaces\/\d+\/workfiles\/\d+/ }
      within(".image_workfile_content") do
        page.find("img")["src"].should match(/small2.png/)
      end
      click_link "Work Files"
      sleep(1)
      click_link("All files")
      click_link("Image files")
      within(".workfile_list") do
        page.should have_content("small2.png")
      end
    end

  it "creates and lists code workfiles" do
      create_valid_workspace(:name => "codesort")
      wait_until { page.find('a[data-dialog="WorkspaceSettings"]').text == "Edit Workspace"}
      click_link("Work Files")
      click_button("Upload File")
      within("#facebox") do
        attach_file("workfile[contents]", File.join(File.dirname(__FILE__), '../fixtures/somecode.r'))
        click_button("Upload File")
      sleep(2)
      end

      wait_until { current_route =~ /workspaces\/\d+\/workfiles\/\d+/ }
      within(".text_workfile_content") do
        page.should have_content("main()")
      end
      click_link "Work Files"
      sleep(1)
      click_link("All files")
      click_link("Code files")
      within(".workfile_list") do
          page.should have_content("somecode.r")
      end
  end

  it "creates and lists code workfiles" do
    create_valid_workspace(:name => "other file sort")
    wait_until { page.find('a[data-dialog="WorkspaceSettings"]').text == "Edit Workspace"}
    click_link("Work Files")
    click_button("Upload File")
    within("#facebox") do
      attach_file("workfile[contents]", File.join(File.dirname(__FILE__), '../fixtures/somepdf.pdf'))
      click_button("Upload File")
    sleep(2)
    end

    wait_until { current_route =~ /workspaces\/\d+\/workfiles\/\d+/ }
    page.should have_content("Cannot preview this work file")
    click_link "Work Files"
    sleep(1)
    click_link("All files")
    click_link("Other files")
    within(".workfile_list") do
      page.should have_content("somepdf.pdf")
    end
  end

end
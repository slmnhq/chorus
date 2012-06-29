require File.join(File.dirname(__FILE__), 'spec_helper')

describe "Listing workfiles by type" do
  before(:each) do
    login('edcadmin', 'secret')
  end

  it "creates and displays a text workfile using file sort" do
    create_valid_workspace(:name => "textfilesort")
    wait_until { page.find('a[data-dialog="WorkspaceSettings"]').text == "Edit Workspace"}
    click_link("Work Files")

    # upload a text file
    click_button("Upload File")
    wait_for_ajax
    within("#facebox") do
      attach_file("workfile[contents]", File.join(File.dirname(__FILE__), '../fixtures/some.txt'))
      click_button("Upload File")
    end
    wait_until { current_route =~ /workspaces\/\d+\/workfiles\/\d+/ }
    within(".text_workfile_content") do
      page.should have_content("hello")
    end
    click_link "Work Files"

    #create a sql file
    create_valid_workfile ({:name => "listingsql"})

    # create an img file
    click_link("Work Files")
    click_button("Upload File")
    within("#facebox") do
      attach_file("workfile[contents]", File.join(File.dirname(__FILE__), '../fixtures/small2.png'))
      click_button("Upload File")
      wait_for_ajax
    end

    wait_until { current_route =~ /workspaces\/\d+\/workfiles\/\d+/ }
    within(".image_workfile_content") do
      page.find("img")["src"].should match(/small2.png/)
    end

    #create a code file
    click_link("Work Files")
    click_button("Upload File")
    within("#facebox") do
      attach_file("workfile[contents]", File.join(File.dirname(__FILE__), '../fixtures/somecode.r'))
      click_button("Upload File")
      wait_for_ajax
    end
    wait_until { current_route =~ /workspaces\/\d+\/workfiles\/\d+/ }
    within(".text_workfile_content") do
      page.should have_content("main()")
    end

    # create an unpreviewable workfile
    click_link("Work Files")
    click_button("Upload File")
    within("#facebox") do
      attach_file("workfile[contents]", File.join(File.dirname(__FILE__), '../fixtures/somepdf.pdf'))
      click_button("Upload File")
      wait_for_ajax
    end
    wait_until { current_route =~ /workspaces\/\d+\/workfiles\/\d+/ }
    page.should have_content("Cannot preview this work file")

    # verify filters

    click_link "Work Files"
    click_link("All files")
    click_link("Text files")
    within(".workfile_list") do
      page.should have_content("some.txt")
    end

    click_link("All files")
    click_link("SQL files")
    within(".workfile_list") do
      page.should have_content("listingsql.sql")
    end

    click_link("All files")
    click_link("Image files")
    within(".workfile_list") do
      page.should have_content("small2.png")
    end

    click_link("All files")
    click_link("Code files")
    within(".workfile_list") do
      page.should have_content("somecode.r")
    end

    click_link("All files")
    click_link("Other files")
    within(".workfile_list") do
      page.should have_content("somepdf.pdf")
    end
  end
end
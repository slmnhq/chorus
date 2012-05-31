require File.join(File.dirname(__FILE__), 'spec_helper')

describe " add a workfile" do
  before(:each) do
    login('edcadmin', 'secret')
  end

  it "creates another wf" do
    create_valid_workspace()
    create_valid_workfile()
  end

  it "creates and displays an image workfile" do
    create_valid_workspace(:name => "FooWorkspace")
    wait_until { page.find('a[data-dialog="WorkspaceSettings"]').text == "Edit Workspace"}
    click_link("Work Files")
    click_button("Upload File")
    within("#facebox") do
      attach_file("workfile[contents]", File.join(File.dirname(__FILE__), '../fixtures/small2.png'))
      click_button("Upload File")
    end

    wait_until { current_route =~ /workspaces\/\d+\/workfiles\/\d+/ }
    within(".image_workfile_content") do
      page.find("img")["src"].should match(/small2.png/)
    end
  end

  it "creates and displays a text workfile" do
    create_valid_workspace(:name => "FooWorkspace")
    wait_until { page.find('a[data-dialog="WorkspaceSettings"]').text == "Edit Workspace"}
    click_link("Work Files")
    click_button("Upload File")
    within("#facebox") do
      attach_file("workfile[contents]", File.join(File.dirname(__FILE__), '../fixtures/some.txt'))
      click_button("Upload File")
    end

    wait_until { current_route =~ /workspaces\/\d+\/workfiles\/\d+/ }
    within(".text_workfile_content") do
      page.should have_content("hello")
    end
  end

  it "creates and displays an binary workfile" do
    create_valid_workspace(:name => "FooWorkspace")
    wait_until { page.find('a[data-dialog="WorkspaceSettings"]').text == "Edit Workspace" }
    click_link("Work Files")
    click_button("Upload File")
    within("#facebox") do
      attach_file("workfile[contents]", File.join(File.dirname(__FILE__), '../fixtures/binary.tar.gz'))
      click_button("Upload File")
    end

    wait_until { current_route =~ /workspaces\/\d+\/workfiles\/\d+/ }
    within(".main_content") do
      page.should have_content("This work file cannot be previewed")
    end
  end

  it "creates and displays a text workfile and take care of name conflict" do
    create_valid_workspace(:name => "WorkspaceForFileNameConflict")
    wait_until { page.find('a[data-dialog="WorkspaceSettings"]').text == "Edit Workspace" }
    click_link("Work Files")
    click_button("Upload File")
    within("#facebox") do
      attach_file("workfile[contents]", File.join(File.dirname(__FILE__), '../fixtures/some.txt'))
      click_button("Upload File")
    end
    click_link("Work Files")
    click_button("Upload File")
    within("#facebox") do
      attach_file("workfile[contents]", File.join(File.dirname(__FILE__), '../fixtures/some.txt'))
      click_button("Upload File")
    end

    click_link("Work Files")
    wait_until { page.find('button[data-dialog="WorkfilesImport"]').text == "Upload File" }
    workfiles = page.all("li.workfile")

    workfiles.first.text.should == "some.txt"
    workfiles.last.text.should == "some_1.txt"
  end
end

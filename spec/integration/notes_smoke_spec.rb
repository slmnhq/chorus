require File.join(File.dirname(__FILE__), 'spec_helper')

describe "Notes" do
  before do
    login(users(:admin))
  end
  
  describe "creating a note on a GPDB instance" do
    it "contains the note" do
      instance = gpdb_instances(:greenplum)
      visit("#/instances")
      wait_for_ajax
      within ".greenplum_instance ul" do
        find("li:contains('#{instance.name}')").click
      end
      click_link "Add a note"

      within_modal do
        set_cleditor_value("body", "Note on the instance")
        click_button "Add Note"
        wait_for_ajax
      end

      instance.events.first.body.should == "Note on the instance"
    end
  end

  describe "creating a note on a workspace" do
    it "creates the note" do
      workspace = workspaces(:alice_public)
      visit("#/workspaces/#{workspace.id}")
      wait_for_ajax
      click_link "Add a note"

      within_modal do
        set_cleditor_value("body", "Note on the workspace")
        click_button "Add Note"
        wait_for_ajax
      end
      workspace.events.first.body.should == "Note on the workspace"
    end
  end


  describe "creating a note on a hadoop instance" do
    it "creates the note" do
      hadoop_instance = hadoop_instances(:hadoop)
      visit("#/instances")
      wait_for_ajax
      within ".hadoop_instance ul" do
        find("li:contains('#{hadoop_instance.name}')").click
      end
      wait_for_ajax
      click_link "Add a note"

      within_modal do
        set_cleditor_value("body", "Note on the hadoop instance")
        click_button "Add Note"
        wait_for_ajax
      end

      hadoop_instance.events.first.body.should == "Note on the hadoop instance"
    end
  end

  describe "creating a note on a workfile" do
    it "creates the note" do
      workfile = workfiles(:alice_public)
      workspace = workfile.workspace
      visit("#/workspaces/#{workspace.id}/workfiles")
      within ".workfile_list" do
        find("li:contains('#{workfile.file_name}')").click
      end
      wait_for_ajax
      click_link "Add a note"

      within_modal do
        set_cleditor_value("body", "Note on a workfile")
        click_button "Add Note"
        wait_for_ajax
      end

      workfile.events.first.body.should == "Note on a workfile"
    end
  end
end
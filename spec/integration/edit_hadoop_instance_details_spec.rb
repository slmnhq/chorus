require File.join(File.dirname(__FILE__), 'spec_helper')

describe " add an instance " do
  before(:each) do
    login('edcadmin', 'secret')
    page.find("a.add.dialog").click
  end

  create_valid_hadoop_instance(:name => "edit_hadoop_instance")
  hadoop_instance_id = Instance.find_by_name("edit_hadoop_instance").id

  it "edits the hadoop instance name"do
    go_to_instance_page
    fill_in 'name', :with => "HadoopInstanceNewName"
        fill_in 'description', :with => "Change Description"
        click_button "Save Configuration"

  end
end
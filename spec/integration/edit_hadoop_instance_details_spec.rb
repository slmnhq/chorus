require File.join(File.dirname(__FILE__), 'spec_helper')

describe " add an instance " do
  before(:each) do
    login('edcadmin', 'secret')
    page.find("a.add.dialog").click
  end

  it "edits the hadoop instance name"do
    create_valid_hadoop_instance(:name => "edit_hadoop_instance")
    # instance will be selected
    edit_hadoop_instance(:name => "HadoopInstanceNewName", :description => "Change Description")
  end
end
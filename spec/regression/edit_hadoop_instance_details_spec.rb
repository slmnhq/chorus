require File.join(File.dirname(__FILE__), 'spec_helper')

describe " add an instance " do
  before(:each) do
    login('edcadmin', 'secret')
    page.find("a.add.dialog").click
  end

  it "edits the hadoop instance name"do
    create_valid_hadoop_instance(:name => "edit_hadoop_instance")
    instance_1_id = HadoopInstance.find_by_name("edit_hadoop_instance").id
    visit("#/instances")
    within(".instance_provider.hadoop_instance") do
      page.find("li[data-hadoop-instance-id='#{instance_1_id}']").click
    end

    # instance will be selected
    edit_hadoop_instance(:name => "HadoopInstanceNewName", :description => "Change Description")
    within(".instance_provider.hadoop_instance") do
      page.find("li[data-hadoop-instance-id='#{instance_1_id}']").should have_content("HadoopInstanceNewName")
      page.find("li[data-hadoop-instance-id='#{instance_1_id}']").should have_content("Change Description")
    end
  end
end
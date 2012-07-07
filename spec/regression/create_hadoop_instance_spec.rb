require File.join(File.dirname(__FILE__), '../integration/spec_helper')

describe "adding an instance " do
  before(:each) do
    login('edcadmin', 'secret')
  end

  it "tries to create a hadoop instance with an invalid name" do
    visit("#/instances")
    click_button "Add instance"

    within_modal do
      choose("register_existing_hadoop")
      fill_in 'name', :with => "hadoop invalid instance name"
      fill_in 'description', :with => "hadoop instance"
      fill_in 'host', :with => "gillette.sf.pivotallabs.com"
      fill_in 'port', :with => "8020"
      fill_in 'username', :with => "hadoop"
      fill_in 'groupList', :with => "hadoop"
      find(".submit").click
    end
    field_errors.should_not be_empty

    within_modal do
      fill_in 'name', :with => "hadoop_invalid_instance_name"
      find(".submit").click
    end
    find('.instance_list').should have_content("hadoop_invalid_instance_name")
  end

  it "tries to create a hadoop instance with invalid port and host" do
    visit("#/instances")
    click_button "Add instance"

    within_modal do
      choose("register_existing_hadoop")

      fill_in 'name', :with => "hadoop_host_port"
      fill_in 'description', :with => "hadoop instance"
      fill_in 'host', :with => "gillett.sf.pivotallabs.com"
      fill_in 'port', :with => "8020"
      fill_in 'username', :with => "hadoop"
      fill_in 'groupList', :with => "hadoop"
      find(".submit").click
    end
    page.should have_content"Unable to determine HDFS server version. Check connection parameters"

    within_modal do
      fill_in 'host', :with => "gillette.sf.pivotallabs.com"
      fill_in 'port', :with => "8020"
      find(".submit").click
    end
    find('.instance_list').should have_content("hadoop_host_port")
  end
end


require File.join(File.dirname(__FILE__), 'spec_helper')

describe " add an instance " do
  before(:each) do
    login('edcadmin', 'secret')
    page.find("a.add.dialog").click
  end

  it "creates a hadoop instance" do
    create_valid_hadoop_instance()
  end

  it "tries to create a hadoop instance with an invalid name" do
    visit("#/instances")
      wait_until { current_route == "/instances" && page.has_selector?("button[data-dialog=InstancesNew]") }
      click_button "Add instance"
      within("#facebox") do
        choose("register_existing_hadoop")
        find_hadoop_instance_dialog

        fill_in 'name', :with => "hadoop invalid instance name"
        fill_in 'description', :with => "hadoop instance"
        fill_in 'host', :with => "gillette.sf.pivotallabs.com"
        fill_in 'port', :with => "8020"
        fill_in 'username', :with => "hadoop"
        fill_in 'groupList', :with => "hadoop"
        find(".submit").click
      end
    field_errors.should_not be_empty

    within("#facebox") do
      fill_in 'name', :with => "hadoop_invalid_instance_name"
      find(".submit").click
    end
    wait_until { current_route == "/instances" }
    find('.instance_list').should have_content("hadoop_invalid_instance_name")
  end

  it "tries to create a hadoop instance with invalid port and host" do
    visit("#/instances")
    wait_until { current_route == "/instances" && page.has_selector?("button[data-dialog=InstancesNew]") }
    click_button "Add instance"
    within("#facebox") do
      choose("register_existing_hadoop")
      find_hadoop_instance_dialog

      fill_in 'name', :with => "hadoop_host_port"
      fill_in 'description', :with => "hadoop instance"
      fill_in 'host', :with => "gillett.sf.pivotallabs.com"
      fill_in 'port', :with => "8020"
      fill_in 'username', :with => "hadoop"
      fill_in 'groupList', :with => "hadoop"
      find(".submit").click
    end
    page.should have_content"Unable to determine HDFS server version. Check connection parameters"

    within("#facebox") do
      fill_in 'host', :with => "gillett.sf.pivotallabs.com"
      fill_in 'port', :with => "802"
      find(".submit").click
    end
    page.should have_content"Unable to determine HDFS server version. Check connection parameters"

    within("#facebox") do
      fill_in 'host', :with => "gillette.sf.pivotallabs.com"
      fill_in 'port', :with => "802"
      find(".submit").click
      sleep(2)
    end
    page.should have_content"Timeout while connecting "

    within("#facebox") do
      fill_in 'host', :with => "gillette.sf.pivotallabs.com"
      fill_in 'port', :with => "8020"
      find(".submit").click
    end
    wait_until { current_route == "/instances" }
    find('.instance_list').should have_content("hadoop_host_port")

  end

  it "tries to register a hadoop instance with wrong grouplist and username" do
    visit("#/instances")
    wait_until { current_route == "/instances" && page.has_selector?("button[data-dialog=InstancesNew]") }
    click_button "Add instance"
    within("#facebox") do
      choose("register_existing_hadoop")
      find_hadoop_instance_dialog

      fill_in 'name', :with => "hadoop_host_port"
      fill_in 'description', :with => "hadoop instance"
      fill_in 'host', :with => "gillett.sf.pivotallabs.com"
      fill_in 'port', :with => "8020"
      fill_in 'username', :with => "hadoo"
      fill_in 'groupList', :with => "hadoop"
      find(".submit").click
    end
    page.should have_content"Unable to determine HDFS server version. Check connection parameters"

    within("#facebox") do
      fill_in 'username', :with => "hadoop"
      fill_in 'groupList', :with => "hadoo"
      find(".submit").click
    end
    page.should have_content"Unable to determine HDFS server version. Check connection parameters"

    within("#facebox") do
      fill_in 'username', :with => "hadoo"
      fill_in 'groupList', :with => "hadoo"
      find(".submit").click
    end
    page.should have_content"Unable to determine HDFS server version. Check connection parameters"

    within("#facebox") do
      fill_in 'username', :with => "hadoop"
      fill_in 'groupList', :with => "hadoop"
      click_button "Add Instance"
    end
    wait_until { current_route == "/instances" }
    find('.instance_list').should have_content("hadoop_host_port")

  end


end


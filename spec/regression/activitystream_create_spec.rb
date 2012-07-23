require File.join(File.dirname(__FILE__), '../integration/spec_helper')

describe " system generated activities " do
  before(:each) do
    login('edcadmin', 'secret')
  end

  it "creates an activity stream when a gpdb instance is created" do
    create_gpdb_instance(:name => "gpdb_instance")
    gpdb_instance_id = Instance.find_by_name("gpdb_instance").id
    go_to_home_page
    page.should have_content "EDC Admin added a new instance gpdb_instance"
    go_to_instance_page
    page.find(".instance_provider li[data-greenplum-instance-id='#{gpdb_instance_id}']").click
    page.should have_content "EDC Admin added a new instance gpdb_instance"
    go_to_user_list_page
    within(".list") do
      click_link "EDC Admin"
    end
    page.should have_content "EDC Admin added a new instance gpdb_instance"
  end

  it "System generates activity stream for gpdb instance name change" do
    name = "changechorusname"

    create_gpdb_instance(:name => name)
    gpdb_instance_id = Instance.find_by_name(name).id

    go_to_home_page
    page.should have_content "EDC Admin added a new instance #{name}"

    go_to_instance_page
    page.find(".instance_provider li[data-greenplum-instance-id='#{gpdb_instance_id}']").click

    click_link "Edit Instance"
    fill_in 'name', :with => "editchorusname"
    click_submit_button

    go_to_home_page
    page.should have_content "EDC Admin changed the name of instance editchorusname from changechorusname to editchorusname"

    go_to_instance_page
    page.find(".instance_provider li[data-greenplum-instance-id='#{gpdb_instance_id}']").click
    page.should have_content "EDC Admin changed the name of instance editchorusname from changechorusname to editchorusname"

    go_to_user_list_page
    within(".list")do
      click_link "EDC Admin"
    end
    page.should have_content "EDC Admin changed the name of instance editchorusname from changechorusname to editchorusname"


  end

  it "System generates activity stream for hadoop instance name change" do

    create_valid_hadoop_instance(:name => "hadoopchangename")
    hadoop_id = HadoopInstance.find_by_name("hadoopchangename").id

    go_to_home_page
    page.should have_content "EDC Admin added a new instance hadoopchangename"

    go_to_instance_page
    within(".instance_provider.hadoop_instance") do
      wait_for_ajax
      page.find("li[data-hadoop-instance-id='#{hadoop_id}']").click
    end
    click_link "Edit Instance"
    fill_in 'name', :with => "hadoopnamechange"
    click_submit_button

    page.should have_content "EDC Admin changed the name of instance hadoopnamechange from hadoopchangename to hadoopnamechange"

        go_to_user_list_page
        within(".list") do
          click_link "EDC Admin"
        end
        page.should have_content "EDC Admin changed the name of instance hadoopnamechange from hadoopchangename to hadoopnamechange"

  end

  it "Creates an activity stream when a hadoop instance is created" do
    create_valid_hadoop_instance(:name => "hadoop_instance")
    hadoop_instance_id = HadoopInstance.find_by_name("hadoop_instance").id

    go_to_home_page
    page.should have_content "EDC Admin added a new instance hadoop_instance"

    go_to_instance_page
    wait_for_ajax
    within(".instance_provider.hadoop_instance") do
      wait_for_ajax
      page.find("li[data-hadoop-instance-id='#{hadoop_instance_id}']").click
    end
    page.should have_content "EDC Admin added a new instance hadoop_instance"

    go_to_user_list_page
    within(".list") do
      click_link "EDC Admin"
    end
    page.should have_content "EDC Admin added a new instance hadoop_instance"
  end

  xit "System generates activity stream for instance owner change (29788349)" do

  end

  it "System generates activity stream for WORKFILE_CREATED" do

    create_valid_workspace
    create_valid_workfile(:name => "aswf")
    wait_for_ajax
    page.should have_content "EDC Admin added file aswf.sql"

    go_to_home_page
    page.should have_content "EDC Admin added file aswf.sql"

    go_to_user_list_page
    within(".list") do
      click_link "EDC Admin"
    end
    page.should have_content "EDC Admin added file aswf.sql"
  end

  it "Creates system Generated activity when a user is added" do
    create_valid_user(:first_name => "Daddy", :last_name => "cool")
    go_to_home_page
    page.should have_content ("User Daddy cool added to Chorus")
    go_to_user_list_page
    within(".list") do
      click_link "Daddy cool"
    end
    page.should have_content ("User Daddy cool added to Chorus")
  end

end

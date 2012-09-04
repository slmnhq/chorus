require File.join(File.dirname(__FILE__), 'spec_helper')

describe " system generated activities " do
  before(:each) do
    login('edcadmin', 'secret')
  end

  it "creates an activity stream when a gpdb instance is created" do
    create_gpdb_instance(:name => "gpdb_instance")
    gpdb_instance_id = GpdbInstance.find_by_name("gpdb_instance").id
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
    gpdb_instance_id = GpdbInstance.find_by_name(name).id

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


  it "System generates activity stream for WorkfileCreated" do

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

  it "create system generate activity when a workspace is created" do

    create_valid_workspace(:name => "workspace_create", :shared => true)
    wait_for_ajax
    page.should have_content "EDC Admin created workspace workspace_create"

    go_to_home_page
    wait_for_ajax
    page.should have_content "EDC Admin created workspace workspace_create"

    go_to_user_list_page
    within(".list")  do
      click_link "EDC Admin"
    end
    wait_for_ajax
    page.should have_content "EDC Admin created workspace workspace_create"

  end

  it "create system generate activity when a workspace is made public" do

    create_valid_workspace(:name => "workspace_public")
    wait_for_ajax
    page.should have_content "EDC Admin created workspace workspace_public"
    click_link "Edit Workspace"
    check "Publicly available"
    click_submit_button
    wait_for_ajax
    page.should have_content "EDC Admin made workspace workspace_public public"

    go_to_home_page
    wait_for_ajax
    page.should have_content "EDC Admin made workspace workspace_public public"

    go_to_user_list_page
    within(".list")  do
      click_link "EDC Admin"
    end
    wait_for_ajax
    page.should have_content "EDC Admin made workspace workspace_public public"

  end

  it "create system generate activity when a workspace is made private" do

    create_valid_workspace(:name => "workspace_private", :shared => true)
    wait_for_ajax
    page.should have_content "EDC Admin created workspace workspace_private"
    click_link "Edit Workspace"
    uncheck "Publicly available"
    click_submit_button
    wait_for_ajax
    page.should have_content "EDC Admin made workspace workspace_private private"

    go_to_home_page
    wait_for_ajax
    page.should have_content "EDC Admin made workspace workspace_private private"

  end

  it "creates system generated activity when a dataset is associated to a workspace" do

    login('edcadmin','secret')
    create_valid_workspace(:name => "associate_dataset_as")
    wait_for_ajax
    workspace_id = Workspace.find_by_name("associate_dataset_as").id
    create_gpdb_instance(:name => "data_associate_as")
    click_link"data_associate_as"
    wait_for_ajax
    click_link "gpdb_garcia"
    wait_for_ajax
    click_link "gpdb_test_schema"
    wait_for_ajax
    page.should have_content "base_table1"
    click_link "Associate dataset with a workspace"

    within(".collection_list") do
      page.find("li[data-id='#{workspace_id}']").click
    end
    click_submit_button
    wait_for_ajax
    page.should have_content "EDC Admin associated the table base_table1 to workspace associate_dataset_as"

    go_to_workspace_page
    click_link "associate_dataset"
    click_link "Data"
    wait_for_ajax
    page.should have_content "base_table1"
    click_link"base_table1"
    wait_for_ajax
    page.should have_content "EDC Admin associated the table base_table1 to workspace associate_dataset_as"

    go_to_home_page
    page.should have_content "EDC Admin associated the table base_table1 to workspace associate_dataset_as"

  end

  it "creates system generated activity when archiving a workspace" do
    workspace_name = "archiving_ws_as"
    create_valid_workspace(:name => workspace_name, :shared => true)
    click_link "Edit Workspace"
    wait_for_ajax

    within_modal do
      choose("workspace_archived")
      click_submit_button
      wait_for_ajax
    end


    page.should_not have_content("Add or Edit Members")
    page.should_not have_content("Add an insight")
    page.should_not have_content("Add a note")
    page.should_not have_content("Add a sandbox")

    page.should have_content "EDC Admin archived workspace archiving_ws_as"

    go_to_home_page
    wait_for_ajax
    page.should have_content "EDC Admin archived workspace archiving_ws_as"

    go_to_user_list_page
    within(".list")  do
      click_link "EDC Admin"
    end
    wait_for_ajax
    page.should have_content "EDC Admin archived workspace archiving_ws_as"
  end

  it "creates system generated activity when unarchiving a workspace" do
    workspace_name = "unarchiving_ws_as"
    create_valid_workspace(:name => workspace_name, :shared => true)
    click_link "Edit Workspace"
    wait_for_ajax

    within_modal do
      choose("workspace_archived")
      click_submit_button
      wait_for_ajax
    end
    page.should have_content "EDC Admin archived workspace unarchiving_ws_as"

    click_link "Edit Workspace"
    wait_for_ajax

    within_modal do
      choose("workspace_active")
      click_submit_button
      wait_for_ajax
    end

    page.should have_content("Add or Edit Members")
    page.should have_content("Add an insight")
    page.should have_content("Add a note")
    page.should have_content("Add a sandbox")

    page.should have_content "EDC Admin restored workspace unarchiving_ws_as from the archive"

    go_to_home_page
    wait_for_ajax
    page.should have_content "EDC Admin restored workspace unarchiving_ws_as from the archive"

    go_to_user_list_page
    within(".list")  do
      click_link "EDC Admin"
    end
    wait_for_ajax
    page.should have_content "EDC Admin restored workspace unarchiving_ws_as from the archive"
  end

  it "creates activity stream when users are added on to a workspace" do

    create_valid_user
    create_valid_workspace(:name => "addmembers", :shared => true)
    wait_for_ajax
    click_link "Add or Edit Members"
    within_modal do
      click_link "Add all"
      click_submit_button
    end
    page.should have_content "EDC Admin added"

    go_to_home_page
    page.should have_content "EDC Admin added"

    go_to_user_list_page
    within(".list")  do
      click_link "EDC Admin"
    end
    wait_for_ajax
    page.should have_content "EDC Admin added"

  end

  it "creates system generated activity when a sandbox is added" do
    create_gpdb_instance(:name => "sandboxas")
    inst_name = "sandboxas"
    gpdb_instance_id = GpdbInstance.find_by_name(inst_name).id
    go_to_workspace_page
    create_valid_workspace(:name => "sandboxas")

    click_link "Add a sandbox"
    wait_for_ajax(5)
    #instance
    page.execute_script("$('select[name=instance]').selectmenu('value', '#{gpdb_instance_id}')")
    page.execute_script("$('.instance .select_container select').change();")
    wait_for_ajax(5)
    #database
    page.execute_script("$('select[name=database]').selectmenu('value', '1')")
    page.execute_script("$('.database .select_container select').change();")
    wait_for_ajax(5)
    #schema
    page.execute_script("$('select[name=schema]').selectmenu('value', '1')")
    page.execute_script("$('.schema .select_container select').change();")

    click_submit_button
    wait_for_ajax
    page.should have_content " EDC Admin added a sandbox"
    go_to_home_page
    page.should have_content "EDC Admin added a sandbox to workspace sandboxas"

  end


  xit "generates system activity when an instance owner is changed" do
    #There is a bug and it has been filed waiting on the bug to complete this test

  end

  xit "generates system activity when an external table is created from hdfs" do
    #There is bug and not able to create an external table
    create_valid_hadoop_instance(:name => "hdfs_as")
    hdfs1_id = HadoopInstance.find_by_name("hdfs_as").id
    wait_for_ajax
    go_to_instance_page
    within(".instance_provider.hadoop_instance") do
      page.find("li[data-hadoop-instance-id='#{hdfs1_id}']").click
    end
    click_link "hdfs_as"
    wait_for_ajax
    page.should have_content "case_sf_311.csv"
    click_link "case_sf_311.csv"
    wait_for_ajax
    page.should have_content "1157509,06/30/2012 11:52 PM,,Open,210 WEST POINT RD,SFHA Requests,SFHA - Emergency"
    click_link "Create as an external table"
    within_modal do
      fill_in 'tableName', :with => "hdfs_as"
      click_button "Create External Table"
    end


  end

  it "generates system activity when I upgrade the version of the file" do

    create_valid_workspace(:name => "workfile_upgradas", :shared => true)
    wait_for_ajax
    create_valid_workfile(:name => "upgrade_version")
    wait_for_ajax
    page.find(".save .save_file_as").click
    wait_until { page.find(".qtip[aria-hidden=false]") }
    page.find("a[data-menu-name=new]").click
    click_button "Save New Version"
    wait_for_ajax
    within "#sidebar" do
      page.find("li[data-name='activity']").click
    end
    page.should have_content "EDC Admin added Version 2"
    click_link "Summary"
    wait_for_ajax
    page.should have_content "EDC Admin added Version 2 of work file upgrade_version"
    go_to_home_page
    page.should have_content "EDC Admin added Version 2 of work file upgrade_version.sql in workspace workfile_upgradas"

  end

end
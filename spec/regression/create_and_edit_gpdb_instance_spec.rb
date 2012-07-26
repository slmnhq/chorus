require File.join(File.dirname(__FILE__), '../integration/spec_helper')

describe " add an instance " do
  before(:each) do
    login('edcadmin', 'secret')
    #page.find("a.add.dialog").click
  end

  it "tries to create an instance with an invalid name" do
    create_gpdb_instance(:name => "instance name")
    field_errors.should_not be_empty
    create_gpdb_instance(:name => "instance_name")
    verify_instance_name("instance_name")
  end

  it "tries to create an instance with an invalid host and port" do
    # Incorrect port
    create_gpdb_instance(:name => "invalid_instance", :port => 2344)
    sleep(1)
    page.find('.errors').should have_content("The driver encountered an unknown error")
    # Incorrect host
    create_gpdb_instance(:name => "invalid_instance", :host => "gillett.sf.pivotallabs.com")
    #page.find('.errors').should have_content("could not translate host name")
    page.find('.errors').should have_content("The connection attempt failed")
    # Incorrect host and port
    create_gpdb_instance(:name => "invalid_instance", :host => "gillett.sf.pivotallabs.com", :port => 2344)
    #page.find('.errors').should have_content("could not translate host name")
    page.find('.errors').should have_content("The connection attempt failed")
    # Still can register an instance
    create_gpdb_instance(:name => "valid_instance")
    verify_instance_name("valid_instance")
  end

  it "tries to create an instance with an invalid db username and password" do
    open_gpdb_instance_dialog
    fill_in 'name', :with => "dbpass_dbuser"
    fill_in 'description', :with => "GPDB instance creation"
    fill_in 'host', :with => "chorus-gpdb40.sf.pivotallabs.com"
    fill_in 'port', :with => "5432"
    fill_in 'dbUsername', :with => "gpadmin"
    fill_in 'dbPassword', :with => "secrettt"
    check("register_greenplum_shared")
    click_submit_button
    page.find('.errors').should have_content("FATAL: password authentication failed for user")

    within(".register_existing_greenplum") do
      fill_in 'dbUsername', :with => "gpadmi"
      fill_in 'dbPassword', :with => "secrettt"
    end
    click_submit_button
    page.find('.errors').should have_content("FATAL: password authentication failed for user")

    within(".register_existing_greenplum") do
      fill_in 'dbUsername', :with => "gpadmi"
      fill_in 'dbPassword', :with => "secret"
    end
    click_submit_button
    page.find('.errors').should have_content("FATAL: password authentication failed for user")

    within(".register_existing_greenplum")do
      fill_in 'dbUsername', :with => "gpadmin"
      fill_in 'dbPassword', :with => "secret"
    end
    click_submit_button
    find('.instance_list').should have_content("dbpass_dbuser")
  end
end


describe "Editing instance details" do
  before(:each) do
    login('edcadmin', 'secret')
  end

  context "greenplum instances" do
    it "should allow editing of the instance name and description" do
      create_gpdb_instance(:name => "Instance1")
      create_gpdb_instance(:name => "Instance2")

      instance_1_id = Instance.find_by_name("Instance1").id
      visit("#/instances")
      within(".instance_provider") do
        page.find("li[data-greenplum-instance-id='#{instance_1_id}']").click
      end
      click_link "Edit Instance"

      within_modal do
        fill_in 'name', :with => "ChangeInstanceName"
        fill_in 'description', :with => "Change Description"
        click_button "Save Configuration"
      end

      page.find("li[data-greenplum-instance-id='#{instance_1_id}']").should have_content("ChangeInstanceName")
      page.find("li[data-greenplum-instance-id='#{instance_1_id}']").should have_content("Change Description")
    end

    it "should allow the editing of the instance host and port" do
      create_gpdb_instance(:name => "validinstance")
      validinstance_id = Instance.find_by_name("validinstance").id
      visit("#/instances")
      within(".instance_provider") do
        page.find("li[data-greenplum-instance-id='#{validinstance_id}']").click
      end
      click_link "Edit Instance"
      within_modal do
        fill_in 'host', :with => "chorus-gpdb40.sf.pivotallabs.com"
        fill_in 'port', :with => "5432"
        click_button "Save Configuration"
      end

    end

  end
end
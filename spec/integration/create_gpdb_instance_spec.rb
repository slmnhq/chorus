require File.join(File.dirname(__FILE__), 'spec_helper')

describe " add an instance " do
  before(:each) do
    login('edcadmin', 'secret')
    #page.find("a.add.dialog").click
  end

  it "creates an instance" do
    new_instance_name = "GPDB_inst_sel_test#{Time.now.to_i}"
    create_gpdb_gillette_instance(:name => new_instance_name)
    verify_instance_name(new_instance_name)
  end

  it "tries to create an instance with an invalid name" do
    create_gpdb_gillette_instance(:name => "instance name")
    field_errors.should_not be_empty
    create_gpdb_gillette_instance(:name => "instance_name")
    verify_instance_name("instance_name")
  end

  it "tries to create an instance with an invalid host and port" do
    # Incorrect port
    create_gpdb_gillette_instance(:name => "invalid_instance", :port => 2344)
    sleep(1)
    page.find('.errors').should have_content("The driver encountered an unknown error")
    # Incorrect host
    create_gpdb_gillette_instance(:name => "invalid_instance", :host => "gillett.sf.pivotallabs.com")
    #page.find('.errors').should have_content("could not translate host name")
    page.find('.errors').should have_content("The connection attempt failed")
    # Incorrect host and port
    create_gpdb_gillette_instance(:name => "invalid_instance", :host => "gillett.sf.pivotallabs.com", :port => 2344)
    #page.find('.errors').should have_content("could not translate host name")
    page.find('.errors').should have_content("The connection attempt failed")
    # Still can register an instance
    create_gpdb_gillette_instance(:name => "valid_instance")
    verify_instance_name("valid_instance")
  end

  it "tries to create an instance with an invalid db username and password" do
    open_gpdb_instance_dialog
    fill_in 'name', :with => "dbpass_dbuser"
    fill_in 'description', :with => "GPDB instance creation"
    fill_in 'host', :with => "gillette.sf.pivotallabs.com"
    fill_in 'port', :with => "5432"
    fill_in 'dbUsername', :with => "gpadmin"
    fill_in 'dbPassword', :with => "secre"
    check("register_greenplum_shared")
    click_submit_button
    sleep(5)
    page.find('.errors').should have_content("FATAL: password authentication failed for user")

    within(".register_existing_greenplum") do
      fill_in 'dbUsername', :with => "gpadmi"
      fill_in 'dbPassword', :with => "secre"
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
    visit("/#/instances")
    find('.instance_list').should have_content("dbpass_dbuser")
  end
end

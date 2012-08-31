require File.join(File.dirname(__FILE__), 'spec_helper')

describe "Instances" do
  before do
    login(users(:admin))
    visit("#/instances")
    click_button "Add instance"
  end

  describe "add a gpdb instance" do
    it "creates a instance" do
      within_modal do
        choose("register_existing_greenplum")
        fill_in 'name', :with => "new_gpdb_instance"
        fill_in 'host', :with => WEBPATH['gpdb_instance_db']['gpdb_host']
        fill_in 'port', :with => WEBPATH['gpdb_instance_db']['gpdb_port']
        fill_in 'dbUsername', :with => WEBPATH['gpdb_instance_db']['gpdb_user']
        fill_in 'dbPassword', :with => WEBPATH['gpdb_instance_db']['gpdb_pass']
        click_button "Add Instance"
      end

      find(".greenplum_instance ul").should have_content("new_gpdb_instance")
    end
  end

  describe "adding a hadoop instance" do
    it "creates an instance" do
      within_modal do
        choose("register_existing_hadoop")
        fill_in 'name', :with => "new_hadoop_instance"
        fill_in 'host', :with => WEBPATH['hadoop_instance_db']['host']
        fill_in 'port', :with => WEBPATH['hadoop_instance_db']['port']
        fill_in 'username', :with => WEBPATH['hadoop_instance_db']['username']
        fill_in 'groupList', :with => WEBPATH['hadoop_instance_db']['group_list']
        click_button "Add Instance"
      end

      find(".hadoop_instance ul").should have_content("new_hadoop_instance")
    end
  end
end
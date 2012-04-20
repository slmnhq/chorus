require File.join(File.dirname(__FILE__), 'spec_helper')

describe " add an instance " do
  before(:each) do
    login('edcadmin', 'secret')
    page.find("a.add.dialog").click
  end

  it "creates an instance" do
    within("#facebox") do
      wait_until { page.has_selector?(".register_existing_greenplum input[name=name]")}
      choose("register_existing_greenplum")
      
      within(".register_existing_greenplum") do
        wait_until { find("input[name=name]").visible? }
        fill_in 'name', :with => "GPDB_inst_sel_test#{Time.now.to_i}"
        fill_in 'description', :with => "GPDB instance creation"
        fill_in 'host', :with => "gillette.sf.pivotallabs.com"
        fill_in 'port', :with => "5432"
        fill_in 'dbUserName', :with => "gpadmin"
        fill_in 'dbPassword', :with => "secret"

        check("register_greenplum_shared")
      end

      find(".submit").click
    end
  end

  it "creates an Hadoop Instance" do
    within("#facebox") do
      wait_until { page.has_selector?(".register_existing_hadoop input[name=name]")}
      choose("register_existing_hadoop")

      within(".register_existing_hadoop") do
        wait_until { find("input[name=name]").visible? }
        fill_in 'name', :with => "Hadoop_inst_sel_test#{Time.now.to_i}"
        fill_in 'description', :with => "Hadoop Instance Creation"
        fill_in 'host', :with => "gillette.sf.pivotallabs.com"
        fill_in 'port', :with => "8020"
        fill_in 'userName', :with => "hadoop"
        fill_in 'userGroups', :with => "hadoop"
      end

      find(".submit").click
    end
  end
end

require File.join(File.dirname(__FILE__), 'spec_helper')

describe " add an instance " do
  before(:each) do
    login('edcadmin', 'secret')
    page.find("a.add.dialog").click
  end

  it "creates an instance" do
    new_instance_name = "GPDB_inst_sel_test#{Time.now.to_i}"

    within("#facebox") do
      wait_until { page.has_selector?(".register_existing_greenplum input[name=name]")}
      choose("register_existing_greenplum")
      wait_until { !page.has_selector?(".register_existing_greenplum.collapsed")}
      within(".register_existing_greenplum") do
        wait_until { find("input[name=name]").visible? }
        wait_until { find("textarea[name=description]").visible? }
        wait_until { find("input[name=host]").visible? }
        wait_until { find("input[name=port]").visible? }
        wait_until { find("input[name=dbUsername]").visible? }
        wait_until { find("input[name=dbPassword]").visible? }

        fill_in 'name', :with => new_instance_name
        fill_in 'description', :with => "GPDB instance creation"
        fill_in 'host', :with => "gillette.sf.pivotallabs.com"
        fill_in 'port', :with => "5432"
        fill_in 'dbUsername', :with => "gpadmin"
        fill_in 'dbPassword', :with => "secret"

        check("register_greenplum_shared")
      end

      find(".submit").click
    end

    find('.instance_list').should have_content(new_instance_name)
    visit("/#/instances")
    find('.instance_list').should have_content(new_instance_name)
  end

  xit "creates an Hadoop Instance" do
    within("#facebox") do
      wait_until { page.has_selector?(".register_existing_hadoop input[name=name]")}
      choose("register_existing_hadoop")
      wait_until { !page.has_selector?(".register_existing_hadoop.collapsed")}
      within(".register_existing_hadoop") do
        wait_until { find("input[name=name]").visible? }
        wait_until { find("textarea[name=description]").visible? }
        wait_until { find("input[name=host]").visible? }
        wait_until { find("input[name=port]").visible? }
        wait_until { find("input[name=userName]").visible? }
        wait_until { find("input[name=userGroups]").visible? }

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

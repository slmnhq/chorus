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

  it "creates an Hadoop Instance" do
    hadoop_instance_name = "hadoop_instance"
    create_valid_hadoop_instance(:name => hadoop_instance_name)
    visit("#/instances")
    find('.instance_list').should have_content(hadoop_instance_name)
  end
end

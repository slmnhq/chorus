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

  it "tries to create an instance with an invalid name" do

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

          fill_in 'name', :with => "instance name"
          fill_in 'description', :with => "GPDB instance creation"
          fill_in 'host', :with => "gillette.sf.pivotallabs.com"
          fill_in 'port', :with => "5432"
          fill_in 'dbUsername', :with => "gpadmin"
          fill_in 'dbPassword', :with => "secret"

          check("register_greenplum_shared")
        end

        find(".submit").click
        field_errors.should_not be_empty

        within(".register_existing_greenplum") do
        fill_in 'name', :with => "instance_name"
        end
      find(".submit").click
      end

      find('.instance_list').should have_content("instance_name")
      visit("/#/instances")
      find('.instance_list').should have_content("instance_name")
    end

  it "tries to create an instance with an invalid host and port" do
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

        fill_in 'name', :with => "invalid_instance"
        fill_in 'description', :with => "GPDB instance creation"
        fill_in 'host', :with => "gillette.sf.pivotallabs.com"
        fill_in 'port', :with => "2344"
        fill_in 'dbUsername', :with => "gpadmin"
        fill_in 'dbPassword', :with => "secret"
        check("register_greenplum_shared")
      end
      click_button "Add Instance"
      page.find('.errors').should have_content("could not connect to server")

      within(".register_existing_greenplum") do
        fill_in 'host', :with => "gillett.sf.pivotallabs.com"
        fill_in 'port', :with => "5432"
      end
      click_button "Add Instance"
      page.find('.errors').should have_content("could not translate host name")

      within(".register_existing_greenplum") do
        fill_in 'host', :with => "gillett.sf.pivotallabs.com"
        fill_in 'port', :with => "2344"
      end
      click_button "Add Instance"
      page.find('.errors').should have_content("could not translate host name")

      within(".register_existing_greenplum")do
        fill_in 'host', :with => "gillette.sf.pivotallabs.com"
        fill_in 'port', :with => "5432"
      end
      click_button "Add Instance"
    end
    find('.instance_list').should have_content("invalid_instance")
    visit("/#/instances")
    find('.instance_list').should have_content("invalid_instance")
  end

  it "tries to create an instance with an invalid db username and password" do
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

          fill_in 'name', :with => "dbpass_dbuser"
          fill_in 'description', :with => "GPDB instance creation"
          fill_in 'host', :with => "gillette.sf.pivotallabs.com"
          fill_in 'port', :with => "5432"
          fill_in 'dbUsername', :with => "gpadmin"
          fill_in 'dbPassword', :with => "secre"
          check("register_greenplum_shared")
        end
        click_button "Add Instance"
        page.find('.errors').should have_content("FATAL: password authentication failed for user")

        within(".register_existing_greenplum") do
          fill_in 'dbUsername', :with => "gpadmi"
          fill_in 'dbPassword', :with => "secre"
        end
        click_button "Add Instance"
        page.find('.errors').should have_content("FATAL: password authentication failed for user")

        within(".register_existing_greenplum") do
          fill_in 'dbUsername', :with => "gpadmi"
          fill_in 'dbPassword', :with => "secret"
        end
        click_button "Add Instance"
        page.find('.errors').should have_content("FATAL: password authentication failed for user")

        within(".register_existing_greenplum")do
          fill_in 'dbUsername', :with => "gpadmin"
          fill_in 'dbPassword', :with => "secret"
        end
        click_button "Add Instance"
      end
      find('.instance_list').should have_content("dbpass_dbuser")
      visit("/#/instances")
      find('.instance_list').should have_content("dbpass_dbuser")
    end

end

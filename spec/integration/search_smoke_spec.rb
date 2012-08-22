require File.join(File.dirname(__FILE__), 'spec_helper')

describe "searches for instance name" do

  xit "searches for instances" do

    login('edcadmin', 'secret')
    create_gpdb_instance(:name => "search_instance")
    wait_for_ajax
    page.execute_script("$('.chorus_search_container>input').val('search_instance');")
    find('.chorus_search_container>input').native.send_keys(:return)
    sleep(2)
    page.should have_content "Search for"
    page.should have_content "search_instance"

  end
end

describe "searches for workspace name" do

  xit "searches for workspaces" do
    login('edcadmin', 'secret')
    create_valid_workspace(:name => "search_workspace")
    wait_for_ajax
    page.execute_script("$('.chorus_search_container>input').val('search_workspace');")
    find('.chorus_search_container>input').native.send_keys(:return)
    sleep(2)
    page.should have_content "Search for"
    page.should have_content "search_workspace"

  end
end

describe "searches for workfile name" do

  xit "searches for workspaces" do
    login('edcadmin', 'secret')
    create_valid_workspace(:name => "workspace", :shared => true)
    wait_for_ajax
    create_valid_workfile(:name => "search_workfile")
    page.execute_script("$('.chorus_search_container>input').val('search_workfile.sql');")
    find('.chorus_search_container>input').native.send_keys(:return)
    sleep(2)
    page.should have_content "Search for"
    page.should have_content "search_workfile"

  end
end

describe "searches for a user name" do

  xit "searches for workspaces" do
    login('edcadmin', 'secret')
    create_valid_user(:first_name => "search", :last_name => "user")
    wait_for_ajax
    page.execute_script("$('.chorus_search_container>input').val('search user');")
    find('.chorus_search_container>input').native.send_keys(:return)
    wait_for_ajax
    page.should have_content "Search for"
    page.should have_content "search user"

  end
end


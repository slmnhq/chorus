require File.join(File.dirname(__FILE__), 'spec_helper')

describe "Create Sandbox" do

  it "creates sandbox in a private workspace" do
    login('edcadmin', 'secret')
    inst_name = "Instance_gpdb42_sand"
    create_gpdb_instance(:name => inst_name, :host => WEBPATH['gpdb_instance42_db']['gpdb_host'],
    :port => WEBPATH['gpdb_instance42_db']['gpdb_port'])
    go_to_workspace_page
    create_valid_workspace(:name => "Private Workspace", :shared => false)
    instance_id = Instance.find_by_name(inst_name).id
#    add_sandbox(:inst_name => inst_name, :db_name => "ChorusAnalytics", :schema_name => "analytics")

    click_link "Add a sandbox"
    wait_for_ajax(5)
    #instance
    page.execute_script("$('select[name=instance]').selectmenu('value', '#{instance_id}')")
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
  end

  it "creates sandbox in a public workspace" do
    login('edcadmin', 'secret')
    inst_name = "Instance_gpdb42_sand"
    go_to_workspace_page
    create_valid_workspace(:name => "Public Workspace")
    instance_id = Instance.find_by_name(inst_name).id
#    add_sandbox(:inst_name => inst_name, :db_name => "ChorusAnalytics", :schema_name => "analytics")

    click_link "Add a sandbox"
    wait_for_ajax(5)
#instance
    page.execute_script("$('select[name=instance]').selectmenu('value', '#{instance_id}')")
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
  end
end


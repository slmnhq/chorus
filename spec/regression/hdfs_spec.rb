require File.join(File.dirname(__FILE__), '../integration/spec_helper')

describe "adding an txt ext table " do

  it "tries to create an external table from text file" do
    login('edcadmin', 'secret')
    create_gpdb_instance(:name => "exttxttablegp")
    create_valid_workspace(:name => "exttxttabletxt")
    wait_for_ajax
    inst_name = "exttxttablegp"
    instance_id = Instance.find_by_name(inst_name).id
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
    go_to_home_page
    create_valid_hadoop_instance(:name => "exttabletxt")
    click_link "exttabletxt"
    wait_for_ajax
    click_link "case_sf_311_subset_text.txt"
    wait_for_ajax
    click_link "Create as an external table"
    within_modal do
      fill_in "tableName", :with => "exttabletxt"
      click_submit_button
    end
    go_to_workspace_page
    click_link "exttxttabletxt"
    click_link "Data"
    wait_for_ajax
    page.should have_content "exttable"
    click_link "exttabletxt"

  end
end

describe "adding an csv ext table " do

  it "tries to create an external table from text file" do
    login('edcadmin', 'secret')
    create_gpdb_instance(:name => "exttablecsvgp")
    create_valid_workspace(:name => "exttablecsv")
    wait_for_ajax
    inst_name = "exttablecsvgp"
    instance_id = Instance.find_by_name(inst_name).id
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
    go_to_home_page
    create_valid_hadoop_instance(:name => "exttablecsvhd")
    click_link "exttablecsvhd"
    wait_for_ajax
    click_link "case_sf_311.csv"
    wait_for_ajax
    click_link "Create as an external table"
    within_modal do
      fill_in "tableName", :with => "exttablecsv"
      click_submit_button
    end
    go_to_workspace_page
    click_link "exttable"
    click_link "Data"
    wait_for_ajax
    page.should have_content "exttable"
    click_link "exttablecsv"

  end
end
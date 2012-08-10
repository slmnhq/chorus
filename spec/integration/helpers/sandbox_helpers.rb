
def create_new_sandbox(params={})
    instance_id = Instance.find_by_name(params[:inst_name]).id || 1
    database_id = params[:db_name] || 1
    schema_id = params[:schema_name] || 1
    
    click_link "Add a sandbox"
    #instance
    page.execute_script("$('select[name=instance]').selectmenu('value', '#{instance_id}')")
    page.execute_script("$('.instance .select_container select').change();")
    wait_for_ajax(5)
    #database
    page.execute_script("$('select[name=database]').selectmenu('value', '#{db_id}')")
    page.execute_script("$('.database .select_container select').change();")
    wait_for_ajax(5)
    #schema
    page.execute_script("$('select[name=schema]').selectmenu('value', '#{schema_id}')")
    page.execute_script("$('.schema .select_container select').change();")

    click_submit_button
end
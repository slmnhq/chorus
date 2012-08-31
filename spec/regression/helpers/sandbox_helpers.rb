
def add_sandbox(params={})

    instance = Instance.find_by_name(params[:inst_name])
    instance.refresh_databases
    puts("-----Here instance #{instance.name}")
    database = instance.databases.find_by_name(params[:db_name])
    GpdbSchema.refresh(instance.owner_account, database)
    puts("-----Here database #{database.id}")
    schema = database.schemas.find_by_name(params[:schema_name])
    puts("-----Here schema #{schema.name}")

    click_link "Add a sandbox"
    wait_for_ajax(5)
    #instance
    page.execute_script("$('select[name=instance]').selectmenu('value', '#{instance.id}')")
    page.execute_script("$('.instance .select_container select').change();")
    wait_for_ajax(5)
    #database
    page.execute_script("$('select[name=database]').selectmenu('value', '#{database.id}')")
    page.execute_script("$('.database .select_container select').change();")
    wait_for_ajax(5)
    sleep(20)
    #schema
    page.execute_script("$('select[name=schema]').selectmenu('value', '#{schema.id}')")
    page.execute_script("$('.schema .select_container select').change();")

    click_submit_button
end
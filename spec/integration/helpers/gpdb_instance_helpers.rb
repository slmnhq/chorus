def create_valid_instance(params)
    name = params[:name] || "GPDB_instance#{Time.now.to_i}"
    visit("#/instances")
    wait_until { current_route == "/instances" && page.has_selector?("button[data-dialog=InstancesNew]") }
    click_button "Add instance"
    within("#facebox") do
        choose("register_existing_greenplum")
        wait_until { find("input[name=name]").visible? }
        wait_until { find("textarea[name=description]").visible? }
        wait_until { find("input[name=host]").visible? }
        wait_until { find("input[name=port]").visible? }
        wait_until { find("input[name=dbUsername]").visible? }
        wait_until { find("input[name=dbPassword]").visible? }

        fill_in 'name', :with => name
        fill_in 'description', :with => "sandbox creation"
        fill_in 'host', :with => "gillette.sf.pivotallabs.com"
        #fill_in 'host', :with => "rh55-qvm89.sanmateo.greenplum.com"
        fill_in 'port', :with => "5432"
        fill_in 'dbUsername', :with => "gpadmin"
        #fill_in 'db_username', :with => "edcadmin"
        fill_in 'dbPassword', :with => "secret"
        uncheck("register_greenplum_shared")
        find(".submit").click
    end
end

def find_gpdb_instance_dialog
  wait_until { find("input[name=name]").visible? }
  wait_until { find("textarea[name=description]").visible? }
  wait_until { find("input[name=host]").visible? }
  wait_until { find("input[name=port]").visible? }
  wait_until { find("input[name=dbUsername]").visible? }
  wait_until { find("input[name=dbPassword]").visible? }
end

def create_gpdb_instance(params={})
  name = params[:name] || "GPDB_instance#{Time.now.to_i}"

  visit("#/instances")
  wait_until { current_route == "/instances" && page.has_selector?("button[data-dialog=InstancesNew]") }
  click_button "Add instance"
  within("#facebox") do
    choose("register_existing_greenplum")
    find_gpdb_instance_dialog
    fill_in 'name', :with => name
    fill_in 'description', :with => params[:desc]
    fill_in 'host', :with => params[:host]
    fill_in 'port', :with => params[:port]
    fill_in 'dbUsername', :with => params[:dbuser]
    fill_in 'dbPassword', :with => params[:dbpass]
    check("register_greenplum_shared") if params[:shared] == true
    click_submit_button
  end
  wait_until { current_route == "/instances" }
  find('.instance_list').should have_content(name)
  sleep(3)
end

def create_gpdb_gillette_instance(params={})
  name = params[:name] || "GPDB_GilletteInstance#{Time.now.to_i}"
  desc = params[:desc] || "Creating Gillette GPDB Instance"
  create_gpdb_instance(:name => name,
                       :desc => desc,
                       :host => WEBPATH['gpdb_instance']['gillette_host'],
                       :port => WEBPATH['gpdb_instance']['gillette_port'],
                       :dbuser => WEBPATH['gpdb_instance']['gillette_user'],
                       :dbpass => WEBPATH['gpdb_instance']['gillette_pass'],
                       :shared => params[:shared])
end

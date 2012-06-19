# Find widgets in gpdb instance dialog
def find_gpdb_instance_dialog
  wait_until { find("input[name=name]").visible? }
  wait_until { find("textarea[name=description]").visible? }
  wait_until { find("input[name=host]").visible? }
  wait_until { find("input[name=port]").visible? }
  wait_until { find("input[name=dbUsername]").visible? }
  wait_until { find("input[name=dbPassword]").visible? }
end

# Update fields in open gpdb instance dialog.
=begin
def update_gpdb_instance_dialog(params={})
  within(".register_existing_greenplum") do

    fill_in 'dbUsername', :with => "gpadmi"
    fill_in 'dbPassword', :with => "secre"
  end
    click_button "Add Instance"
end
=end

# Register a new GPDB instance, parameters: name, desc, host, port, dbuser, dbpass, shared.
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
    sleep(3)
  end
end

# Make sure that instance name is listed on the instance list page.
def verify_instance_name(name)
  inst_route = WEBPATH['instance']['route']
  visit(inst_route)
  wait_until { inst_route == inst_route && page.has_selector?(WEBPATH['instance']['new_btn']) }
  find(WEBPATH['instance']['list']).should have_content(name)
  sleep(3)
end

# Register a new instance on Gillette, the only params available: name, desc, shared. Other parameters
# read from webpath.yaml
def create_gpdb_gillette_instance(params={})
  create_gpdb_instance(:name => params[:name] || "GPDB_GilletteInstance#{Time.now.to_i}",
                       :desc => params[:desc] || "Creating Gillette GPDB Instance",
                       :host => params[:host] || WEBPATH['gpdb_instance']['gillette_host'],
                       :port => params[:port] || WEBPATH['gpdb_instance']['gillette_port'],
                       :dbuser => params[:dbuser] || WEBPATH['gpdb_instance']['gillette_user'],
                       :dbpass => params[:dbpass] || WEBPATH['gpdb_instance']['gillette_pass'],
                       :shared => params[:shared])
end

# Register a new instance on Gillette
def create_gpdb_gillette_instance_no_ui(params={})
  Gpdb::InstanceRegistrar.create!({
      :name => params[:name] || "GPDB_GilletteInstance#{Time.now.to_i}",
      :port => params[:port] || WEBPATH['gpdb_instance']['gillette_port'],
      :host => params[:host] || WEBPATH['gpdb_instance']['gillette_host'],
      :maintenance_db => "postgres",
      :provision_type => "register",
      :description => "old description",
      :db_username => params[:dbuser] || WEBPATH['gpdb_instance']['gillette_user'],
      :db_password => params[:dbpass] || WEBPATH['gpdb_instance']['gillette_pass']
    }.merge(params), current_user)
end
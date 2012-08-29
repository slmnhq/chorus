# Opens gpdb dialog and verifies fields
def open_gpdb_instance_dialog
  visit("#/gpdb_instances")
  click_button "Add instance"
  within_modal do
    choose("register_existing_greenplum")
  end
end

# Fills up instance dialog
def fill_up_instance_dialog(params={})

  open_gpdb_instance_dialog
  fill_in 'name', :with => params[:name]
  fill_in 'description', :with => params[:desc]
  fill_in 'host', :with => params[:host]
  fill_in 'port', :with => params[:port]
  fill_in 'dbUsername', :with => params[:dbuser]
  fill_in 'dbPassword', :with => params[:dbpass]
  check("register_greenplum_shared") if params[:shared] == true
end

# Registers a new GPDB instance, parameters: name, desc, host, port, dbuser, dbpass, shared.
def register_gpdb_instance(params={})
  params[:name] ||= "GPDB_instance#{Time.now.to_i}"
  visit("#/gpdb_instances")
  fill_up_instance_dialog(params)
  click_submit_button
end

# Make sure that instance name is listed on the instance list page.
def verify_instance_name(name)
  inst_route = WEBPATH['gpdb_instance']['route']
  visit(inst_route)
  find(WEBPATH['gpdb_instance']['list']).should have_content(name)
end

# Create a greenplum instance, the only params available: name, desc, shared. Other parameters
# read from webpath.yaml
def create_gpdb_instance(params={})
  register_gpdb_instance(:name => params[:name] || "GPDB_Instance#{Time.now.to_i}",
                         :desc => params[:desc] || "Creating GPDB Instance",
                         :host => params[:host] || WEBPATH['gpdb_instance_db']['gpdb_host'],
                         :port => params[:port] || WEBPATH['gpdb_instance_db']['gpdb_port'],
                         :dbuser => params[:dbuser] || WEBPATH['gpdb_instance_db']['gpdb_user'],
                         :dbpass => params[:dbpass] || WEBPATH['gpdb_instance_db']['gpdb_pass'],
                         :shared => params[:shared])
end

def create_gpdb_instance41()
  create_gpdb_instance(:name => "GPDB_Instance41#{Time.now.to_i}",
                         :desc => "Creating GPDB Instance",
                         :host => WEBPATH['gpdb_instance41_db']['gpdb_host'],
                         :port => WEBPATH['gpdb_instance41_db']['gpdb_port'],
                         :dbuser => WEBPATH['gpdb_instance41_db']['gpdb_user'],
                         :dbpass => WEBPATH['gpdb_instance41_db']['gpdb_pass'])
end

def create_gpdb_instance42()
  create_gpdb_instance(:name => "GPDB_Instance41#{Time.now.to_i}",
                         :desc => "Creating GPDB Instance",
                         :host => WEBPATH['gpdb_instance42_db']['gpdb_host'],
                         :port => WEBPATH['gpdb_instance42_db']['gpdb_port'],
                         :dbuser => WEBPATH['gpdb_instance42_db']['gpdb_user'],
                         :dbpass => WEBPATH['gpdb_instance42_db']['gpdb_pass'])
end

def create_gpdb_instance42()
  create_gpdb_instance(:name => "GPDB_Instance42#{Time.now.to_i}",
                         :desc => "Creating GPDB Instance",
                         :host => WEBPATH['gpdb_instance42_db']['gpdb_host'],
                         :port => WEBPATH['gpdb_instance42_db']['gpdb_port'],
                         :dbuser => WEBPATH['gpdb_instance42_db']['gpdb_user'],
                         :dbpass => WEBPATH['gpdb_instance42_db']['gpdb_pass'])
end

# Register a new greenplum instance
def create_gpdb_instance_no_ui(params={})
  Gpdb::InstanceRegistrar.create!({
                                    :name => params[:name] || "GPDB_Instance#{Time.now.to_i}",
                                    :port => params[:port] || WEBPATH['gpdb_instance_db']['gpdb_port'],
                                    :host => params[:host] || WEBPATH['gpdb_instance_db']['gpdb_host'],
                                    :maintenance_db => "postgres",
                                    :provision_type => "register",
                                    :description => "old description",
                                    :db_username => params[:dbuser] || WEBPATH['gpdb_instance_db']['gpdb_user'],
                                    :db_password => params[:dbpass] || WEBPATH['gpdb_instance_db']['gpdb_pass']
                                  }.merge(params), current_user)
end
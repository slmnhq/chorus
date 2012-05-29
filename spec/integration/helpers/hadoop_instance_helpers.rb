def create_valid_hadoop_instance(params = {})
  name = params[:name] || "GPDB_instance#{Time.now.to_i}"
  visit("#/instances")
  wait_until { current_route == "/instances" && page.has_selector?("button[data-dialog=InstancesNew]") }
  click_button "Add instance"
  within("#facebox") do
    choose("register_existing_hadoop")
    wait_until { find("input[name=name]").visible? }
    wait_until { find("textarea[name=description]").visible? }
    wait_until { find("input[name=host]").visible? }
    wait_until { find("input[name=port]").visible? }
    wait_until { find("input[name=username]").visible? }
    wait_until { find("input[name=group_list]").visible? }

    fill_in 'name', :with => name
    fill_in 'description', :with => "hadoop instance"
    fill_in 'host', :with => "gillette.sf.pivotallabs.com"
    fill_in 'port', :with => "8020"
    fill_in 'username', :with => "hadoop"
    fill_in 'group_list', :with => "hadoop"
    find(".submit").click
  end
  wait_until { current_route == "/instances" }
  sleep(3)
end


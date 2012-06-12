def find_hadoop_instance_dialog
  wait_until { find("input[name=name]").visible? }
  wait_until { find("textarea[name=description]").visible? }
  wait_until { find("input[name=host]").visible? }
  wait_until { find("input[name=port]").visible? }
  wait_until { find("input.username").visible? }
  wait_until { find("input.group_list").visible? }
end

def create_valid_hadoop_instance(params = {})
  name = params[:name] || "hadoop_instance#{Time.now.to_i}"
  visit("#/instances")
  wait_until { current_route == "/instances" && page.has_selector?("button[data-dialog=InstancesNew]") }
  click_button "Add instance"
  within("#facebox") do
    choose("register_existing_hadoop")
    find_hadoop_instance_dialog

    fill_in 'name', :with => name
    fill_in 'description', :with => "hadoop instance"
    fill_in 'host', :with => "gillette.sf.pivotallabs.com"
    fill_in 'port', :with => "8020"
    fill_in 'username', :with => "hadoop"
    fill_in 'groupList', :with => "hadoop"
    find(".submit").click
  end
  wait_until { current_route == "/instances" }
  wait_until { find('.instance_list').has_content?(name) }
  sleep(3)
end

def edit_hadoop_instance(params={})
  # assigning parameters to the different fields
  name = params[:name] || "hadoop_instance#{Time.now.to_i}"
  description = params[:description] || "Hadoop edit instance change description"
  click_link "Edit Instance"
  find_hadoop_instance_dialog

  within("#facebox") do
      fill_in 'name', :with => name if name
      fill_in 'description', :with => description if description
      fill_in 'host', :with => "gillette.sf.pivotallabs.com"
      fill_in 'port', :with => "8020"
      fill_in 'username', :with => "hadoop"
      fill_in 'groupList', :with => "hadoop"
      click_button "Save Configuration"
      #find(".submit").click
    end
    wait_until { current_route == "/instances" }
    wait_until { find('.instance_list').has_content?(name) }
    sleep(2)
end


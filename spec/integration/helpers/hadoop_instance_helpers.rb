def create_valid_hadoop_instance(name=nil)
    name ||= "hadoop_instance#{Time.now.to_i}"
    visit("#/instances")
    wait_until { current_route == "/instances" && page.has_selector?("button[data-dialog=InstancesNew]") }
    click_button "Add instance"
    within("#facebox") do
       choose("register_existing_greenplum")
       wait_until { page.has_selector?(".register_existing_hadoop input[name=name]")}
       fill_in 'name', :with => "Hadoop_inst_sel_test#{Time.now.to_i}"
       fill_in 'description', :with => "Hadoop Instance Creation"
       fill_in 'host', :with => "gillette.sf.pivotallabs.com"
       fill_in 'port', :with => "8020"
       fill_in 'userName', :with => "hadoop"
       fill_in 'userGroups', :with => "hadoop"
       find(".submit").click
    end

end


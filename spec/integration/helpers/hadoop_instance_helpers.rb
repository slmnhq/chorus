def create_valid_hadoop_instance(params = {})
  name = params[:name] || "hadoop_instance#{Time.now.to_i}"
  visit("#/instances")
  click_button "Add instance"
  within_modal do
    choose("register_existing_hadoop")
    fill_in 'name', :with => name
    fill_in 'description', :with => "hadoop instance"
    fill_in 'host', :with => "chorus-gphd11.sf.pivotallabs.com"
    fill_in 'port', :with => "8020"
    fill_in 'username', :with => "hadoop"
    fill_in 'groupList', :with => "hadoop"
    find(".submit").click
  end
  wait_for_ajax

end

def edit_hadoop_instance(params={})
  # assigning parameters to the different fields
  name = params[:name] || "hadoop_instance#{Time.now.to_i}"
  description = params[:description] || "Hadoop edit instance change description"
  click_link "Edit Instance"

  within_modal do
      fill_in 'name', :with => name if name
      fill_in 'description', :with => description if description
      fill_in 'host', :with => "chorus-gphd11.sf.pivotallabs.com"
      fill_in 'port', :with => "8020"
      fill_in 'username', :with => "hadoop"
      fill_in 'groupList', :with => "hadoop"
      click_button "Save Configuration"
  end
end


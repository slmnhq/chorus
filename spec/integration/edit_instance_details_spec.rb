require File.join(File.dirname(__FILE__), 'spec_helper')

describe "Editing instance details" do
  before(:each) do
    login('edcadmin', 'secret')
  end

  context "greenplum instances" do
    it "should allow editing of the instance name and description" do
      create_gpdb_gillette_instance(:name => "Instance1")
      create_gpdb_gillette_instance(:name => "Instance2")

      instance_1_id = Instance.find_by_name("Instance1").id
      visit("#/instances")
      within(".instance_provider") do
        page.find("li[data-greenplum-instance-id='#{instance_1_id}']").click
      end
      click_link "Edit Instance"

      within("#facebox") do
        fill_in 'name', :with => "ChangeInstanceName"
        fill_in 'description', :with => "Change Description"
        click_button "Save Configuration"
      end

      page.find("li[data-greenplum-instance-id='#{instance_1_id}']").should have_content("ChangeInstanceName")
      page.find("li[data-greenplum-instance-id='#{instance_1_id}']").should have_content("Change Description")
    end

    it "should allow the editing of the instance host and port" do
      create_gpdb_gillette_instance(:name => "validinstance")
      validinstance_id = Instance.find_by_name("validinstance").id
      visit("#/instances")
      within(".instance_provider") do
            page.find("li[data-greenplum-instance-id='#{validinstance_id}']").click
          end
      click_link "Edit Instance"
      within("#facebox") do
        fill_in 'host', :with => "gillette.sf.pivotallabs.com"
        fill_in 'port', :with => "5432"
        click_button "Save Configuration"
      end

    end
  end
end
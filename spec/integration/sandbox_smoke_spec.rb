require File.join(File.dirname(__FILE__), 'spec_helper')

describe "Sandbox" do

  let(:workspace) { workspaces(:private_with_no_collaborators) }
  let(:instance) { GpdbIntegration.real_gpdb_instance }
  let(:database) { instance.databases.find_by_name("ChorusAnalytics") }
  let(:schema) { database.schemas.first }

  before do
    login(users(:admin))
  end

  it "creates sandbox in workspace" do
    visit("#/workspaces/#{workspace.id}")
    click_link "Add a sandbox"
    wait_for_ajax

    #instance
    page.execute_script("$('select[name=instance]').selectmenu('value', '#{instance.id}')")
    page.execute_script("$('.instance .select_container select').change();")
    wait_for_ajax
    #database
    page.execute_script("$('select[name=database]').selectmenu('value', '#{database.id}')")
    page.execute_script("$('.database .select_container select').change();")
    wait_for_ajax
    #schema
    page.execute_script("$('select[name=schema]').selectmenu('value', '#{schema.id}')")
    page.execute_script("$('.schema .select_container select').change();")
    click_button "Add Sandbox"
    wait_for_ajax

    workspace.reload.sandbox.should == schema
  end
end


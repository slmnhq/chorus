require File.join(File.dirname(__FILE__), 'spec_helper')

describe "Sandbox", :database_integration do

  let(:workspace) { workspaces(:private_with_no_collaborators) }
  let(:instance) { GpdbIntegration.real_gpdb_instance }
  let(:database) { GpdbIntegration.real_database }
  let(:schema) { database.schemas.first }

  before do
    login(users(:admin))
  end

  it "creates sandbox in workspace" do
    visit("#/workspaces/#{workspace.id}")
    click_link "Add a sandbox"
    wait_for_ajax

    #instance
    page.execute_script("$('select[name=instance]').val('#{instance.id}')")
    page.execute_script("$('select[name=instance]').selectmenu('refresh')")
    page.execute_script("$('select[name=instance]').change()")
    wait_for_ajax
    #database
    page.execute_script("$('select[name=database]').val('#{database.id}')")
    page.execute_script("$('select[name=database]').selectmenu('refresh')")
    page.execute_script("$('select[name=database]').change()")
    wait_for_ajax
    #schema
    page.execute_script("$('select[name=schema]').val('#{schema.id}')")
    page.execute_script("$('select[name=schema]').selectmenu('refresh')")
    page.execute_script("$('select[name=schema]').change()")
    click_button "Add Sandbox"
    wait_for_ajax

    workspace.reload.sandbox.should == schema
  end
end


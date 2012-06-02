require File.join(File.dirname(__FILE__), 'spec_helper')

describe " add an instance " do
  before(:each) do
    login('edcadmin', 'secret')
  end

  it "creates an instance" do
    create_valid_instance(:name => "InstanceWithSchemas")
    click_link("InstanceWithSchemas")
    click_link("Analytics")
    click_link("analytics")
  end

end

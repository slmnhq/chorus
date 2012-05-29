require File.join(File.dirname(__FILE__), 'spec_helper')

describe " add an instance " do
  before(:each) do
    login('edcadmin', 'secret')
  end

  it "creates another wf" do
    create_valid_workspace()
    create_valid_workfile()
  end
end

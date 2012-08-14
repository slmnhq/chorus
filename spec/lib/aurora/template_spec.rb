require 'spec_helper'
describe Aurora::Template do

  describe "constructor" do
    let(:java_template) { Object.new }
    before do
      mock(java_template).name { "name" }
      mock(java_template).memory_in_mb { 1024 }
      mock(java_template).getvCPUNumber { 3 }
    end
    it "initialize the class with proper values" do
      template = Aurora::Template.new(java_template)
      template.name.should == "name"
      template.memory_size.should == 1024
      template.vcpu_number.should == 3
    end
  end
end
require 'spec_helper'

describe Aurora::TemplatePresenter, :type => :view do
  before(:each) do
    java_template_mock = Object.new
    mock(java_template_mock).name { "name" }
    mock(java_template_mock).memory_in_mb { 1024 }
    mock(java_template_mock).getvCPUNumber { 3 }

    @template = Aurora::Template.new(java_template_mock)
    @presenter = Aurora::TemplatePresenter.new(@template, view)
  end

  describe "#to_hash" do
    before do
      @hash = @presenter.to_hash
    end

    it "includes status" do
      @hash[:name].should  == "name"
      @hash[:memory_size_in_mb].should == 1024
      @hash[:vcpu_number].should == 3
    end
  end
end

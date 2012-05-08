require "spec_helper"
describe Workspace do
  before do
    @workspace = FactoryGirl.create :workspace
  end

  describe "validations" do
    it { should validate_presence_of :name }
  end

end
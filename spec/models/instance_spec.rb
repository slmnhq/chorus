require "spec_helper"
describe Instance do
  before do
    @instance = FactoryGirl.create :instance
  end

  describe "validations" do
    it { should validate_presence_of :name }
    it { should validate_presence_of :host }
    it { should validate_presence_of :port }
    it { should validate_presence_of :maintenance_db }
  end
end
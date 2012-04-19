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

  describe "associations" do
    it { should belong_to :owner }
  end

  it "should not allow changing inaccessible attributes" do
    instance = FactoryGirl.create(:instance)
    changed_id = 122222
    instance.attributes = {:id => changed_id, :owner_id => changed_id}
    instance.id.should_not == 12222
    instance.owner_id.should_not == 12222
  end
end
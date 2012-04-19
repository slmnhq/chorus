require "spec_helper"
describe Instance do
  before do
    @instance = FactoryGirl.create :instance
  end

  describe "validations" do
    required_fields = [:name, :port, :maintenance_db, :host]

    required_fields.each do |field|
      it "should require field: #{field}" do
        @instance[field] = nil
        @instance.should be_invalid
      end
    end
  end
end
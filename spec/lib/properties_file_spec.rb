require 'spec_helper'

describe PropertiesFile do
  let(:properties_file) {PropertiesFile.read("#{::Rails.root}/spec/fixtures/chorus.properties")}

  it "should create a Hash" do
    properties_file.should be_instance_of Hash
  end

  it "should make values available" do
    properties_file["chorus.database.connection.timeout"].should == "60"
  end
end
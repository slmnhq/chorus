require 'spec_helper'

describe GnipInstancesController do
  before do
    @user = users(:owner)
    log_in @user
  end

  describe "#create" do
    let(:parameters) { { :gnip_instance => {
        :name => 'gnip_instance_name',
        :host => 'http://www.example.com',
        :port => 443,
        :description => 'poopoo',
        :username => 'gnip_username',
        :password => 'gnip_password'
    } } }

    it "reports that the instance was created with the correct owner" do
      post :create, parameters
      response.code.should == "201"
      GnipInstance.last.owner_id.should == @user.id
    end

    it "should add a gnip instance" do
      expect {
        post :create, parameters
      }.to change(GnipInstance, :count).by(1)
    end
  end
end
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
      GnipInstance.last.owner.should == @user
    end

    it "should add a gnip instance" do
      expect {
        post :create, parameters
      }.to change(GnipInstance, :count).by(1)
    end
  end

  describe "#index" do
    let(:gnip_instance) { gnip_instances(:gnip) }

    it "should return correct response code" do
      get :index
      response.code.should == "200"
      decoded_response.length == 1
      decoded_response[0].id = gnip_instance.id
      decoded_response[0].owner.id = gnip_instance.owner_id
    end

  end
end
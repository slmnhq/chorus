require 'spec_helper'

describe GnipInstancesController do
  before do
    @user = users(:owner)
    log_in @user
  end

  let(:gnip_instance) { gnip_instances(:default) }

  describe "#create" do
    context "with Valid credentials" do

      before do
        stub(Gnip::InstanceRegistrar).create!({}, @user) { gnip_instance }
      end

      it "reports that the instance was created with the correct owner" do
        post :create
        response.code.should == "201"
      end
    end

    context "With Invalid credentials" do
      before do
        stub(Gnip::InstanceRegistrar).create!({}, @user) { raise(ApiValidationError) }
      end
      it "raise an error" do
        post :create, parameters
        response.code.should == "422"
      end
    end
  end

  describe "#index" do
    let(:gnip_instance) { gnip_instances(:default) }

    it "should return correct response code" do
      get :index
      response.code.should == "200"
      decoded_response.length.should == 2
      decoded_response[0].id.should == gnip_instance.id
      decoded_response[0].owner.id.should == gnip_instance.owner_id
    end

  end

  describe '#show' do
    let(:gnip_instance) { gnip_instances(:default) }

    it 'presents the gnip instance' do
      get :show, :id => gnip_instance.to_param
      response.code.should == '200'
      decoded_response['name'].should == gnip_instance.name
    end

    generate_fixture 'gnipInstance.json' do
      get :show, :id => gnip_instance.to_param
    end
  end
end
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
        stub(Gnip::InstanceRegistrar).create!(anything, @user) { gnip_instance }
      end

      it "reports that the instance was created with the correct owner" do
        post :create
        response.code.should == "201"
        decoded_response.owner.id.should == @user.id
      end
    end

    context "With Invalid credentials" do
      before do
        stub(Gnip::InstanceRegistrar).create!(anything, @user) { raise(ApiValidationError) }
      end
      it "raise an error" do
        post :create
        response.code.should == "422"
      end
    end

    context "accepts non-nested parameters" do
      before do
        any_instance_of(ChorusGnip) do |c|
          mock(c).auth { true }
        end
      end

      let(:params) do
        {
            :name => "new_gnip_instance",
            :description => "some description",
            :stream_url => "http://www.example.com",
            :username => "gnip_username",
            :password => "gnip_password"
        }
      end

      it "creates a Gnip instance and returns 201" do
        expect {
          post :create, params
        }.to change(GnipInstance, :count).by(1)
        response.code.should == "201"
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
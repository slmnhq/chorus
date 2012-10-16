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
        decoded_response.password.should be_nil
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
      let(:params) do
        {
            :name => "new_gnip_instance",
            :description => "some description",
            :stream_url => "http://www.example.com",
            :username => "gnip_username",
            :password => "gnip_password"
        }

      end

      it "nests the params" do
        stub(Gnip::InstanceRegistrar).create!(params.stringify_keys, anything) { gnip_instance }

        post :create, params
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

    it_behaves_like "a paginated list"
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

  describe '#update' do
    let(:gnip_instance) { gnip_instances(:default) }
    let(:params) { { :id => gnip_instance.id } }

    context "With valid credentials" do
      before do
        stub(Gnip::InstanceRegistrar).update!(gnip_instance.id.to_s, anything) { gnip_instance }
      end

      it 'correctly updates the gnip instance' do
        put :update, params

        response.code.should == '200'
        decoded_response.description.should_not be_blank
        decoded_response.password.should be_blank
      end
    end

    context "With Invalid credentials" do
      before do
        stub(Gnip::InstanceRegistrar).update!(gnip_instance.id.to_s, anything) { raise(ApiValidationError) }
      end
      it "raise an error" do
        post :update, params
        response.code.should == "422"
      end
    end

  end
end
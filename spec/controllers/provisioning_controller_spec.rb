require 'spec_helper'

describe ProvisioningController do
  let(:user) { FactoryGirl.create(:user) }
  before(:each) do
    log_in user
  end

  describe "#show" do
    before do
      any_instance_of(Aurora::Service) do |aurora_service|
        stub(aurora_service).valid? { true }
      end
    end

    it "responds with a success" do
      get :show
      response.code.should == "200"
      decoded_response.install_succeed.should be_true
    end

    generate_fixture "provisioning.json" do
      template = Aurora::Template.new
      template.name = 'small'
      template.vcpu_number = 3
      template.memory_size = 4096

      any_instance_of(Aurora::Service) do |aurora_service|
        stub(aurora_service).templates { [template] }
      end

      get :show
      response.code.should == '200'
    end
  end
end
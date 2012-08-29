require 'spec_helper'

describe ProvisioningController do
  let(:user) { users(:bob) }
  let(:template) { Aurora::Template.new }

  before(:each) do
    log_in user

    template.name = 'small'
    template.vcpu_number = 3
    template.memory_size = 4
  end

  describe "#show" do
    before do
      any_instance_of(Aurora::Service) do |aurora_service|
        stub(aurora_service).valid? { true }
        stub(aurora_service).templates { [template] }
      end
    end

    it "responds with a success" do
      get :show
      response.code.should == "200"
      decoded_response.install_succeed.should be_true
      decoded_response.templates.should_not be_empty
    end

    generate_fixture "provisioning.json" do
      get :show
      response.code.should == '200'
    end
  end
end
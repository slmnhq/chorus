require 'spec_helper'

describe ProvisioningController do
  let(:user) { users(:bob) }
  let(:template) { Aurora::Template.new }

  before(:each) do
    log_in user

    template.name = 'small'
    template.vcpu_number = 3
    template.memory_size = 4096
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

  describe "#create" do
    let(:service_mock) { Object.new }
    let(:database) { Object.new }

    before do
      stub(database).public_ip { "127.0.0.1" }
      stub(Gpdb::InstanceRegistrar).create!(anything, anything)

      mock(Aurora::Service).new(anything) { service_mock }
      mock(service_mock).create_database(HashWithIndifferentAccess.new({
        :template => 'small',
        :db_name => 'database',
        :db_user => 'edcadmin',
        :db_password => 'secret',
        :storage_size_in_gb => "1"
      })) { database }
    end

    it "responds with a success" do
      post :create, {
        :provision =>
          {
            :instance_name => "instance",
            :description => "description",
            :storage_size_in_gb => "1",
            :template => "small",
            :db_name => "database",
            :schema_name => "schema",
            :db_user => "edcadmin",
            :db_password => "secret"
          }
        }

      response.code.should == "201"
    end
  end
end
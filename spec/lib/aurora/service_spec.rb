require 'aurora/service'
require 'spec_helper'

describe Aurora::Service do
  let(:config) do
    {
      :aurora_admin_user => 'bliu@pivotallabs.com',
      :target_rb_name => 'RB',
      :aurora_initialized => true,
      :aurora_service_url => 'https://10.80.129.96/datadirector/services/datacloudWS',
      :gpfdist_port => '8081'
    }
  end
  let(:java_service_mock) { Object.new }

  describe "constructor" do
    context "when aurora is configured" do
      before do
        mock(Aurora::JavaModules::AuroraService).get_instance(anything) { java_service_mock }
      end

      it "connects to the aurora service supplied" do
        aurora = Aurora::Service.new(config)
        aurora.should be_valid
      end
    end

    context "when aurora is not configured" do
      before do
        mock(Aurora::JavaModules::AuroraService).get_instance(anything) { raise StandardError }
      end

      it "sets valid as false" do
        aurora = Aurora::Service.new(config)
        aurora.should_not be_valid
      end
    end
  end

  describe "#all_databases" do
    before do
      mock(Aurora::JavaModules::AuroraService).get_instance(anything) { java_service_mock }
    end

    it "gets all databases from VDD" do
      mock(java_service_mock).all_databases { [] }

      service = Aurora::Service.new(config)
      service.all_databases
    end
  end

  describe "#create_database" do
    before do
      mock(Aurora::JavaModules::AuroraService).get_instance(anything) { java_service_mock }
    end

    it "creates a new database with the small template" do
      mock(java_service_mock).create_database(
          Aurora::JavaModules::AuroraDBTemplate.small,
          'testinstance',
          'instance_admin',
          'secret',
          4
      )

      service = Aurora::Service.new(config)
      service.create_database({
                                  :template => Aurora::DB_SIZE[:small],
                                  :database_name => "testinstance",
                                  :db_username => "instance_admin",
                                  :db_password => "secret",
                                  :size => 4
                              })
    end
  end

  describe "#templates" do
    let(:service) { Aurora::Service.new(config) }

    context "when @valid is true" do
      before do
        mock(Aurora::JavaModules::AuroraService).get_instance(anything) { java_service_mock }
        mock(java_service_mock).get_template_for_chorus {
          [Aurora::DB_SIZE[:medium]]
        }
      end

      it "returns an array of templates" do
        templates = service.templates
        templates.first.name.should == "medium"
        templates.first.memory_size.should == Aurora::DB_SIZE[:medium].getMemoryInMb()
        templates.first.vcpu_number.should == Aurora::DB_SIZE[:medium].getvCPUNumber()
      end
    end

    context "when @valid is false" do
      before do
        mock(Aurora::JavaModules::AuroraService).get_instance(anything) { raise StandardError }
      end

      it "returns an empty array" do
        service.templates.should be_empty
      end
    end
  end

  describe "#find_template_by_name" do
    let(:service) { Aurora::Service.new(config) }

    before do
      mock(Aurora::JavaModules::AuroraService).get_instance(anything) { java_service_mock }
      mock(java_service_mock).get_template_for_chorus {
        [Aurora::DB_SIZE[:small]]
      }
    end

    it "returns the template matching the given name" do
      small_template = service.find_template_by_name("small")
      small_template.name.should == "small"
      small_template.should be_a_kind_of(com.vmware.aurora.model.DBTemplate)
    end
  end
end

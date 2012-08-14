require 'aurora/service'
require 'spec_helper'

describe Aurora::Service do
  let(:config) { File.expand_path(File.dirname(__FILE__) + '/../../../config/aurora.properties')}
  let(:java_service_mock) { Object.new }

  describe "constructor" do
    context "when aurora is configured" do
      before do
        mock(Aurora::Java::AuroraService).get_instance(anything) { java_service_mock }
      end

      it "connects to the aurora service supplied" do
        aurora = Aurora::Service.new(config)
        aurora.should be_valid
      end
    end

    context "when aurora is not configured" do
      before do
        mock(Aurora::Java::AuroraService).get_instance(anything) { raise StandardError }
      end

      it "sets valid as false" do
        aurora = Aurora::Service.new(config)
        aurora.should_not be_valid
      end
    end
  end

  describe "#all_databases" do
    before do
      mock(Aurora::Java::AuroraService).get_instance(anything) { java_service_mock }
    end

    it "gets all databases from VDD" do
      mock(java_service_mock).all_databases { [] }

      service = Aurora::Service.new(config)
      service.all_databases
    end
  end

  describe "create_database" do
    before do
      mock(Aurora::Java::AuroraService).get_instance(anything) { java_service_mock }
    end

    it "creates a new database with the small template" do
      mock(java_service_mock).create_database(
        Aurora::Java::AuroraDBTemplate.small,
        'testinstance',
        'instance_admin',
        'secret',
        4
      )

      service = Aurora::Service.new(config)
      service.create_database({
        :template => Aurora::DB_SIZE[:small],
        :db_name => "testinstance",
        :db_user => "instance_admin",
        :db_password => "secret",
        :storage_size_in_gb => 4
      })
    end
  end

  describe "templates" do
    let(:service) {Aurora::Service.new(config) }

    context "when @valid is true" do
      before do
        mock(Aurora::Java::AuroraService).get_instance(anything) { java_service_mock }
        mock(java_service_mock).get_template_for_chorus {
          [ Aurora::DB_SIZE[:small]]
        }
      end

      it "returns an array of templates" do
        templates = service.templates
        templates.first.name.should == "small"
        templates.first.memory_size.should == 0
        templates.first.vcpu_number.should == 0
      end
    end

    context "when @valid is false" do
      before do
        mock(Aurora::Java::AuroraService).get_instance(anything) { raise StandardError }
      end

      it "returns an empty array" do
        service.templates.should be_empty
      end
    end
  end
end

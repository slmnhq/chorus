require 'spec_helper'

describe AuroraProvider do
  describe(".create_from_aurora_service") do
    before do
      @previous_config = Chorus::Application.config.chorus
    end

    after do
      Chorus::Application.config.chorus = @previous_config
    end

    context "aurora is configured" do
      before do
        mock(Aurora::JavaModules::AuroraService).get_instance(anything) { Object.new }

        aurora_config = YAML.load_file(Rails.root.join('config', 'chorus.yml.example'))['aurora']
        Chorus::Application.config.chorus = {'aurora' => aurora_config}
      end

      it "returns a valid provider" do
        provider = AuroraProvider.create_from_aurora_service
        provider.should be_valid
      end
    end

    context "aurora is not configured" do
      before do
        Chorus::Application.config.chorus = {'aurora' => nil}

        # stub out exception because java library caches service returned from get_instance
        mock(Aurora::JavaModules::AuroraService).get_instance(anything) { raise StandardError }
      end

      it "handles an exception" do
        provider = AuroraProvider.create_from_aurora_service
        provider.should_not be_valid
      end
    end
  end

  describe "#valid?" do

    it "returns the aurora provider status" do
      aurora_service = Object.new
      mock(aurora_service).valid? { true }

      provider = AuroraProvider.new(aurora_service)
      provider.should be_valid
    end
  end

  describe ".provide!" do
    let(:instance) { instances(:aurora) }
    let(:database) { Object.new }
    let(:attributes) { {"template" => "small",
                        "size" => 1,
                        "database_name" => "database"} }

    context "when provisioning succeeds" do
      before do
        stub(database).public_ip { '123.321.12.34' }
        any_instance_of(Aurora::Service) do |service|
          mock(service).find_template_by_name("small") { Aurora::DB_SIZE[:small] }
          mock(service).create_database({
                                          :template => Aurora::DB_SIZE[:small],
                                          :database_name => 'database',
                                          :db_username => 'edcadmin',
                                          :db_password => 'secret',
                                          :size => 1
                                        }) { database }
        end
      end

      it "creates a database" do
        AuroraProvider.provide!(instance.id, attributes)
      end

      it "updates the host of the instance with the correct ip address" do
        AuroraProvider.provide!(instance.id, attributes)
        instance.reload
        instance.host.should == "123.321.12.34"
      end

      it "generates a PROVISIONING_SUCCESS event" do
        AuroraProvider.provide!(instance.id, attributes)
        event = Events::PROVISIONING_SUCCESS.find_by_actor_id(instance.owner)
        event.greenplum_instance.should == instance
      end
    end

    context "when provisioning fails" do
      before do
        any_instance_of(Aurora::Service) do |service|
          mock(service).create_database(anything) { raise StandardError.new("server cannot be reached") }
        end
      end

      it "generates a PROVISIONING_FAIL event" do
        AuroraProvider.provide!(instance.id, attributes)
        event = Events::PROVISIONING_FAIL.find_by_actor_id(instance.owner)
        event.greenplum_instance.should == instance
        event.additional_data['error_message'].should == "server cannot be reached"
      end
    end
  end
end
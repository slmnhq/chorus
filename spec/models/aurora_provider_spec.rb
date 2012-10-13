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
    let(:gpdb_instance) { gpdb_instances(:aurora) }
    let(:database) { Object.new }
    let(:schema_name) { "schema_name" }
    let(:attributes) { {"template" => "small",
                        "size" => 1,
                        "database_name" => "database",
                        "schema_name" => schema_name} }
    let(:new_database) { GpdbDatabase.create({:name => 'database', :gpdb_instance => gpdb_instance}, :without_protection => true) }

    context "when provisioning succeeds" do
      before do
        stub(database).public_ip { '123.321.12.34' }
        any_instance_of(Aurora::Service) do |service|
          mock(service).find_template_by_name("small") { Aurora::DB_SIZE[:small] }
          mock(service).create_database({
                                          :template => Aurora::DB_SIZE[:small],
                                          :database_name => 'database',
                                          :db_username => gpdb_instance.owner_account.db_username,
                                          :db_password => gpdb_instance.owner_account.db_password,
                                          :size => 1,
                                          :schema_name => schema_name
                                        }) { database }
        end

        any_instance_of(GpdbInstance) do |gpdb_instance|
          stub(gpdb_instance).refresh_databases() {}
        end
      end

      it "creates a database" do
        AuroraProvider.provide!(gpdb_instance.id, attributes)
      end

      it "updates the host of the instance with the correct ip address" do
        AuroraProvider.provide!(gpdb_instance.id, attributes)
        gpdb_instance.reload
        gpdb_instance.host.should == "123.321.12.34"
      end

      it "generates a ProvisioningSuccess event" do
        AuroraProvider.provide!(gpdb_instance.id, attributes)
        event = Events::ProvisioningSuccess.find_by_actor_id(gpdb_instance.owner)
        event.greenplum_instance.should == gpdb_instance
      end

      context "state" do
        before do
          mock(Gpdb::ConnectionBuilder).connect!(gpdb_instance, gpdb_instance.owner_account, 'database') {}
        end
        it "updates the state to online" do
          AuroraProvider.provide!(gpdb_instance.id, attributes)
          gpdb_instance.reload
          gpdb_instance.state.should == 'online'
        end
      end

      context "when schema name is not public" do
        before do
          mock(Gpdb::ConnectionBuilder).connect!(gpdb_instance, gpdb_instance.owner_account, 'database') {
          }
          mock(gpdb_instance).databases {
            [new_database]
          }
        end
        it "connects to the newly created database and creates new schema" do
          AuroraProvider.provide!(gpdb_instance.id, attributes)
          gpdb_instance.reload
          gpdb_instance.databases.map(&:name).should include("database")
        end
      end
      context "when new schema name is public" do
        let(:schema_name) { 'public' }
        let(:create_new_schema_called) { false }
        before do
          stub(Gpdb::ConnectionBuilder).connect!(gpdb_instance, gpdb_instance.owner_account, 'database') {
            create_new_schema_called = true
          }
        end
        it "connects to the newly created database and does not create new schema if schema_name is public" do
          AuroraProvider.provide!(gpdb_instance.id, attributes)
          create_new_schema_called.should == false
        end
      end
    end

    context "when provisioning fails" do
      before do
        any_instance_of(Aurora::Service) do |service|
          stub(service).find_template_by_name { 'template' }
          mock(service).create_database(anything) { raise StandardError.new("server cannot be reached") }
        end
      end

      it "generates a ProvisioningFail event" do
        AuroraProvider.provide!(gpdb_instance.id, attributes)
        event = Events::ProvisioningFail.find_last_by_actor_id(gpdb_instance.owner)
        event.greenplum_instance.should == gpdb_instance
        event.additional_data['error_message'].should == "server cannot be reached"
      end

      it "updates the state to fault" do
        AuroraProvider.provide!(gpdb_instance.id, attributes)
        gpdb_instance.reload
        gpdb_instance.state.should == 'fault'
      end

    end
  end
end
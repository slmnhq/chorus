require 'spec_helper'

describe AuroraProvider do
  let(:user) { users(:bob) }

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
      end

      it "returns an invalid provider" do
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

  describe "#provide!" do
    let(:service_mock) { Object.new }
    let(:database) { Object.new }
    let(:attributes) do
      {
          :name => 'instance_name',
          :template => 'small',
          :database_name => 'database',
          :db_username => 'edcadmin',
          :db_password => 'secret',
          :size => 1,
          :schema_name => 'schema',
          :description => 'A description'
      }
    end

    before do
      stub(database).public_ip { '123.321.12.34' }
      stub(Gpdb::ConnectionChecker).check!(anything, anything)

      mock(service_mock).find_template_by_name("small") { Aurora::DB_SIZE[:small] }
      mock(service_mock).create_database({
                                             :template => Aurora::DB_SIZE[:small],
                                             :database_name => 'database',
                                             :db_username => 'edcadmin',
                                             :db_password => 'secret',
                                             :size => 1
                                         }) { database }
    end

    it "creates a database" do
      provider = AuroraProvider.new(service_mock)
      provider.provide!(attributes, user)
    end

    it "creates a greenplum instance" do
      provider = AuroraProvider.new(service_mock)
      provider.provide!(attributes, user)

      instance = Instance.last
      instance.name.should == 'instance_name'
      instance.description.should == 'A description'
      instance.owner.should == user
    end
  end
end
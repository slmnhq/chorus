require 'aurora/service'

describe Aurora::Service do
  let(:config) { File.expand_path(File.dirname(__FILE__) + '/../../../config/aurora.properties')}
  let(:java_service_mock) { Object.new }

  before do
    mock(Java::AuroraService).get_instance(anything) { java_service_mock }
  end

  describe "constructor" do
    it "connects to the aurora service supplied" do
      expect { Aurora::Service.new(config) }.to_not raise_error
    end
  end

  describe "#all_databases" do
    it "gets all databases from VDD" do
      mock(java_service_mock).all_databases { [] }

      service = Aurora::Service.new(config)
      service.all_databases
    end
  end

  describe "create_database" do
    it "creates a new database with the small template" do
      mock(java_service_mock).create_database(
        Java::AuroraDBTemplate.small,
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
end

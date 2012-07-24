require 'aurora/service'

describe Aurora::Service do
  let(:config) { File.expand_path(File.dirname(__FILE__) + '/../../../config/aurora.properties')}

  describe "constructor" do
    it "connects to the aurora service supplied" do
      expect { Aurora::Service.new(config) }.to_not raise_error
    end
  end

  describe "#all_databases" do
    it "gets all databases from VDD" do
      service = Aurora::Service.new(config)
      databases = service.all_databases
      databases.each { |db| puts "db id #{db.id}, db name #{db.name}" }
    end
  end

  describe "create_database" do
    it "creates a new database with the small template" do
      service = Aurora::Service.new(config)
      created_database = service.create_database({
        :template => Aurora::DB_SIZE[:small],
        :db_name => "testinstance",
        :db_user => "instance_admin",
        :db_password => "secret",
        :storage_size_in_gb => 4
      })
      p created_database
      #service.all_databases.select { |d| d.name == "testinstance" }.should_not be_empty
    end
  end
end

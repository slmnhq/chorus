require_relative "../../packaging/install"
require 'fakefs/spec_helpers'

RSpec.configure do |config|
  config.mock_with :rr
end

describe "Install" do
  include FakeFS::SpecHelpers

  let(:installer) { Install.new }

  describe "#get_destination_path" do
    context "user types input" do
      it "captures the path from the user" do
        stub_input "/foo/bar"
        installer.get_destination_path
        installer.destination_path.should == "/foo/bar"
      end
    end

    describe "user enters nothing" do
      it "returns the default path" do
        stub_input nil
        installer.get_destination_path
        installer.destination_path.should == "/opt/chorus"
      end
    end
  end

  describe "#copy_chorus_to_destination" do
    before do
      installer.destination_path = "/opt/chorus"

      FileUtils.mkpath './chorus_installation/'
      FileUtils.touch './chorus_installation/source_file_of_some_kind'
      File.open('./chorus_installation/VERSION', 'w') { |f| f.puts "2.2.0.0" }
    end

    it "creates the destination path" do
      installer.copy_chorus_to_destination
      File.directory?('/opt/chorus').should be_true
    end

    it "creates the correct release path" do
      installer.copy_chorus_to_destination
      File.directory?('/opt/chorus/releases/2.2.0.0').should be_true
    end

    it "copies the files into the release path" do
      installer.copy_chorus_to_destination
      File.exists?('/opt/chorus/releases/2.2.0.0/source_file_of_some_kind').should be_true
    end
  end

  describe "#create_shared_structure" do
    before do
      installer.destination_path = "/opt/chorus"
    end

    it "creates the temporary folders" do
      installer.create_shared_structure

      File.directory?('/opt/chorus/shared/tmp/pids').should be_true
    end

    it "creates the solr index data path" do
      installer.create_shared_structure

      File.directory?('/opt/chorus/shared/solr/data').should be_true
    end

    it "create the logs path" do
      installer.create_shared_structure

      File.directory?('/opt/chorus/shared/log').should be_true
    end

    it "creates the system file uploads path" do
      installer.create_shared_structure

      File.directory?('/opt/chorus/shared/system').should be_true
    end
  end

  describe "#copy_config_files" do
    before do
      installer.destination_path = "/opt/chorus"

      FileUtils.mkdir_p './chorus_installation/config'
      FileUtils.touch './chorus_installation/config/database.yml.example'
      FileUtils.touch './chorus_installation/config/chorus.yml.example'
    end

    it "creates chorus.yml file in shared path" do
      installer.copy_config_files

      File.exists?('/opt/chorus/shared/chorus.yml').should be_true
    end

    it "creates database.yml file in shared path" do
      installer.copy_config_files

      File.exists?('/opt/chorus/shared/database.yml').should be_true
    end
  end

  describe "#link_services" do
    before do
      installer.destination_path = "/opt/chorus"
      FileUtils.mkdir_p './chorus_installation/postgres'
      FileUtils.mkdir_p './chorus_installation/nginx_dist'
      File.open('./chorus_installation/VERSION', 'w') { |f| f.puts "2.2.0.0" }
    end

    it "creates a symlink to a postgres installation" do
      installer.copy_chorus_to_destination
      installer.link_services

      File.readlink('/opt/chorus/postgres').should == '/opt/chorus/releases/2.2.0.0/postgres'
    end

    it "creates a symlink to a nginx installation" do
      installer.copy_chorus_to_destination
      installer.link_services

      File.readlink('/opt/chorus/nginx_dist').should == '/opt/chorus/releases/2.2.0.0/nginx_dist'
    end

    it "creates a symlink to server_control.sh" do
      installer.copy_chorus_to_destination
      installer.link_services

      File.readlink('/opt/chorus/server_control.sh').should == '/opt/chorus/releases/2.2.0.0/packaging/server_control.sh'
    end
  end

  describe "#create_database" do
    before do
      installer.destination_path = "/opt/chorus"
      mock(installer).system("/opt/chorus/postgres/bin/initdb --locale=en_US.UTF-8 /opt/chorus/shared/db")
    end

    it "runs postgres' initdb command and creates the db structure" do
      installer.create_database
    end
  end

  describe "#create_database_config" do
    before do
      installer.destination_path = "/opt/chorus"
      FileUtils.mkdir_p '/opt/chorus/shared/'
      File.open('/opt/chorus/shared/database.yml', 'w') do |f|
        f.puts({'production' => {'password' => 'something', 'username' => 'the_user'}}.to_yaml)
      end
    end

    it "writes a new random password to the database.yml" do
      installer.create_database_config
      installer.database_password.should_not == 'something'
      installer.database_password.length >= 10
      installer.database_user.should == 'the_user'

      YAML.load_file('/opt/chorus/shared/database.yml')['production']['password'].should == installer.database_password
    end
  end

  describe "#create_database_structure" do
    before do
      installer.destination_path = "/opt/chorus"
      installer.database_user = 'the_user'
      installer.database_password = 'secret'

      @call_order = []

      mock(installer).version { "2.2.0.0" }
      mock(installer).sleep(2) { @call_order << "sleep" }

      mock(installer).system("/opt/chorus/server_control.sh start postgres") { @call_order << 'start' }
      mock(installer).system(%Q{/opt/chorus/postgres/bin/psql -d postgres -p8543 -c "CREATE ROLE 'the_user' PASSWORD 'secret' SUPERUSER CREATEDB CREATEROLE INHERIT LOGIN}) { @call_order << "create_user" }
      mock(installer).system("cd /opt/chorus/releases/2.2.0.0 && RAILS_ENV=production bin/rake db:create db:migrate") { @call_order << "migrate" }
      mock(installer).system("/opt/chorus/server_control.sh stop postgres") { @call_order << 'stop' }
    end

    it "creates the database structure" do
      installer.create_database_structure
      @call_order.should == ["start", "sleep", "create_user", "migrate", "stop"]
    end
  end

  describe "#link_current_to_release" do
    before do
      installer.destination_path = "/opt/chorus"
      stub(installer).version { '2.2.0.0' }
      FileUtils.mkdir_p '/opt/chorus '
    end

    it "creates a symlink to the new release from current" do
      installer.link_current_to_release

      File.readlink('/opt/chorus/current').should == '/opt/chorus/releases/2.2.0.0'
    end
  end

  def stub_input(input)
    stub(installer).get_input() { input }
  end
end

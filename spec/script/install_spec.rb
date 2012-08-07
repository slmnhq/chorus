require_relative "../../packaging/install"
require 'fakefs/spec_helpers'

RSpec.configure do |config|
  config.mock_with :rr
end

describe "Install" do
  include FakeFS::SpecHelpers

  let(:installer) { Install.new('.') }
  before do
    stub(installer).prompt(anything)
  end

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

    describe "when the user types a relative path" do
      it "returns the expanded path" do
        stub_input "~/chorus"
        installer.get_destination_path
        installer.destination_path.should == "#{ENV['HOME']}/chorus"
      end
    end
  end

  describe "#get_postgres_build" do
    context "when Linux is CentOS/RHEL 5.5" do
      before do
        FileUtils.mkdir_p("/etc/")
        File.open("/etc/redhat-release", "w") { |f| f.puts "XXXXXXXXX release 5.5 (Final)" }
      end

      it "returns the RedHat 5.5 build" do
        installer.get_postgres_build.should == 'postgres-redhat5.5-9.1.4.tar.gz'
      end
    end

    context "when Linux is CentOS/RHEL 6.2" do
      before do
        FileUtils.mkdir_p("/etc/")
        File.open("/etc/redhat-release", "w") { |f| f.puts "XXXXXXXXX release 6.2 (Final)" }
      end

      it "returns the RedHat 6.2 build" do
        installer.get_postgres_build.should == 'postgres-redhat6.2-9.1.4.tar.gz'
      end
    end

    context "when Linux is SLES 11" do
      before do
        FileUtils.mkdir_p("/etc/")
        File.open("/etc/SuSE-release", "w") do |f|
          f.puts "SuSE"
          f.puts "VERSION = 11"
          f.puts "PATCHLEVEL = 1"
        end
      end

      it "returns the suse11 build" do
        installer.get_postgres_build.should == 'postgres-suse11-9.1.4.tar.gz'
      end
    end

    context "when couldn't guess version/distribution" do
      before do
        mock(installer).prompt("Could not detect your Linux version. Please select one of the following:").times(prompt_times)
        mock(installer).prompt("[1] - RedHat (CentOS/RHEL) 5.5 or compatible").times(prompt_times)
        mock(installer).prompt("[2] - RedHat (CentOS/RHEL) 6.2 or compatible").times(prompt_times)
        mock(installer).prompt("[3] - SuSE Enterprise Linux Server 11 or compatible").times(prompt_times)
        mock(installer).prompt("[4] - Abort install").times(prompt_times)
      end

      let(:prompt_times) { 1 }

      context "when the user selects redhat 5.5" do
        before do
          stub_input("1")
        end

        it "returns the RedHat 5.5 build" do
          installer.get_postgres_build.should == 'postgres-redhat5.5-9.1.4.tar.gz'
        end
      end

      context "when the user selects redhat 6.2" do
        before do
          stub_input("2")
        end

        it "returns the RedHat 6.2 build" do
          installer.get_postgres_build.should == 'postgres-redhat6.2-9.1.4.tar.gz'
        end
      end

      context "when the user selects suse" do
        before do
          stub_input("3")
        end

        it "returns the Suse 11 build" do
          installer.get_postgres_build.should == 'postgres-suse11-9.1.4.tar.gz'
        end
      end

      context "when the user selects abort" do
        before do
          stub_input("4")
        end

        it "bails" do
          expect { installer.get_postgres_build }.to raise_error(Install::InstallationFailed)
        end
      end

      context "unsupported selected" do
        before do
          attempts = ["", "1"]
          stub(installer).get_input() { attempts.shift }
        end

        let(:prompt_times) { 2 }

        it "should show the menu again" do
          installer.get_postgres_build
        end
      end
    end
  end

  describe "#copy_chorus_to_destination" do
    before do
      installer.destination_path = "/opt/chorus"

      FileUtils.mkpath './chorus_installation/'
      FileUtils.touch './chorus_installation/source_file_of_some_kind'
      stub_version
      mock(FileUtils).cp_r('./chorus_installation/.', '/opt/chorus/releases/2.2.0.0', hash_including(:preserve => true))
    end

    it "creates the correct release path" do
      installer.copy_chorus_to_destination
      File.directory?('/opt/chorus/releases/2.2.0.0').should be_true
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
      FileUtils.mkdir_p './chorus_installation/packaging'
      FileUtils.touch './chorus_installation/packaging/database.yml.example'
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
      stub_version
      FileUtils.mkdir_p(installer.destination_path)
    end

    it "creates a symlink to a postgres installation" do
      installer.link_services

      File.readlink('/opt/chorus/postgres').should == '/opt/chorus/releases/2.2.0.0/postgres'
    end

    it "creates a symlink to a nginx installation" do
      installer.link_services

      File.readlink('/opt/chorus/nginx_dist').should == '/opt/chorus/releases/2.2.0.0/nginx_dist'
    end

    it "creates a symlink to server_control.sh" do
      installer.link_services

      File.readlink('/opt/chorus/server_control.sh').should == '/opt/chorus/releases/2.2.0.0/packaging/server_control.sh'
    end
  end

  describe "#link_shared_files" do
    before do
      installer.destination_path = "/opt/chorus"
      stub_version

      installer.link_shared_files
    end

    it "links the chorus.yml file" do
      File.readlink('/opt/chorus/releases/2.2.0.0/config/chorus.yml').should == '/opt/chorus/shared/chorus.yml'
    end

    it "links the database.yml file" do
      File.readlink('/opt/chorus/releases/2.2.0.0/config/database.yml').should == '/opt/chorus/shared/database.yml'
    end

    it "links tmp" do
      File.readlink('/opt/chorus/releases/2.2.0.0/tmp').should == '/opt/chorus/shared/tmp'
    end

    it "links solr" do
      File.readlink('/opt/chorus/releases/2.2.0.0/solr').should == '/opt/chorus/shared/solr'
    end

    it "links log" do
      File.readlink('/opt/chorus/releases/2.2.0.0/log').should == '/opt/chorus/shared/log'
    end

    it "links system" do
      File.readlink('/opt/chorus/releases/2.2.0.0/system').should == '/opt/chorus/shared/system'
    end
  end

  describe "#create_database" do
    before do
      installer.destination_path = "/opt/chorus"
      mock(installer).system("/opt/chorus/postgres/bin/initdb --locale=en_US.UTF-8 /opt/chorus/shared/db 2>&1 > install.log") { true }
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

      mock(installer).system("cd /opt/chorus && ./server_control.sh start postgres 2>&1 > install.log") { @call_order << 'start' }
      mock(installer).system(%Q{/opt/chorus/postgres/bin/psql -d postgres -p8543 -c "CREATE ROLE the_user PASSWORD 'secret' SUPERUSER CREATEDB CREATEROLE INHERIT LOGIN" 2>&1 > install.log}) { @call_order << "create_user" }
      mock(installer).system("cd /opt/chorus/releases/2.2.0.0 && RAILS_ENV=production bin/rake db:create db:migrate 2>&1 > install.log") { @call_order << "migrate" }
      mock(installer).system("cd /opt/chorus && ./server_control.sh stop postgres 2>&1 > install.log") { @call_order << 'stop' }
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

  describe "#extract_nginx" do
    before do
      stub_version
      installer.destination_path = "/opt/chorus"
    end

    it "calls tar to unpack nginx" do
      mock(installer).system("tar xzf /opt/chorus/releases/2.2.0.0/packaging/nginx_dist-1.2.2.tar.gz -C /opt/chorus/releases/2.2.0.0/ 2>&1 > install.log") { true }
      installer.extract_nginx
    end
  end

  describe "#extract_postgres" do
    before do
      stub_version
      installer.destination_path = "/opt/chorus"
    end

    it "calls tar to unpack postgres" do
      installer.instance_variable_set(:@postgres_package, 'postgres-blahblah.tar.gz')
      mock(installer).system("tar xzf /opt/chorus/releases/2.2.0.0/packaging/postgres/postgres-blahblah.tar.gz -C /opt/chorus/releases/2.2.0.0/ 2>&1 > install.log")  { true }
      installer.extract_postgres
    end
  end

  describe "command execution" do
    before() do
      installer.destination_path = '/opt/chorus'
    end

    it "raises an exception if exit code is different than zero" do
      mock(installer).system("cd /opt/chorus && ./server_control.sh start postgres 2>&1 > install.log") { false }
      expect { installer.create_database_structure }.to raise_error(Install::CommandFailed)
    end
  end

  describe "#validate_non_root" do
    context "when the script is being run by root"
    it "raises an exception" do
      mock(Process).uid() { 0 }
      expect { installer.validate_non_root }.to raise_error(Install::NonRootValidationError)
    end

    context "when the script is not run as root" do
      it "should not raise an exception" do
        expect { installer.validate_non_root }.to_not raise_error()
      end
    end
  end

  def stub_input(input)
    stub(installer).get_input() { input }
  end

  def stub_version
    FileUtils.mkdir_p('./chorus_installation')
    File.open('./chorus_installation/version_build', 'w') { |f| f.puts "2.2.0.0" }
  end
end

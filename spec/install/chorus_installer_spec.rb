require_relative "../../packaging/install/chorus_installer"
require 'fakefs/spec_helpers'

RSpec.configure do |config|
  config.mock_with :rr
end

describe ChorusInstaller do
  include FakeFS::SpecHelpers

  let(:installer) { described_class.new(options) }
  let(:options) do
    {
        installer_home: '.',
        version_detector: version_detector,
        logger: logger,
        io: io
    }
  end

  let(:version_detector) { Object.new }
  let(:logger) { Object.new }
  let(:io) { Object.new }

  before do
    ENV['CHORUS_HOME'] = nil
    stub(logger).log(anything)
    stub(installer).prompt(anything)
    stub(io).log(anything)
    stub(io).silent? { false }
  end

  describe "#get_destination_path" do
    before do
      stub(installer).version { "2.2.0.1-8840ae71c" }
      stub(logger).logfile=(anything)
      stub(version_detector).destination_path=(anything)
      stub(version_detector).can_upgrade_2_2?(anything) { upgrade_2_2 }
      stub(version_detector).can_upgrade_legacy? { upgrade_legacy }
      mock(io).prompt_or_default(:destination_path, default_path) { destination_path }
    end

    let(:upgrade_2_2) { false }
    let(:upgrade_legacy) { false }
    let(:default_path) { '/opt/chorus' }
    let(:destination_path) { '/somewhere/chorus' }

    it "should set relevant settings" do
      mock(version_detector).destination_path=('/somewhere/chorus')
      mock(logger).logfile=('/somewhere/chorus/install.log')
      installer.get_destination_path
      installer.destination_path.should == '/somewhere/chorus'
    end

    describe "when the user types a relative path" do
      let(:destination_path) { "~/chorus" }

      it "returns the expanded path" do
        mock(version_detector).destination_path=("#{ENV['HOME']}/chorus")
        mock(logger).logfile=("#{ENV['HOME']}/chorus/install.log")
        installer.get_destination_path
        installer.destination_path.should == "#{ENV['HOME']}/chorus"
      end
    end

    describe "when there is a CHORUS_HOME set" do
      before do
        ENV["CHORUS_HOME"] = default_path + "/current"
      end
      let(:default_path) { "/not/standard/dir" }

      it "should set that as the default" do
        installer.get_destination_path
      end
    end

    context "when not upgrading" do
      it "should do a non-upgrade install" do
        dont_allow(installer).prompt("Existing version of Chorus detected. Upgrading will restart services.  Continue now? [y]:")
        stub_input nil
        installer.get_destination_path
        installer.do_upgrade.should be_false
      end
    end

    describe "when the user specifies a directory that looks like an upgradable Chorus 2.2 install" do
      let(:upgrade_2_2) { true }

      before do
        mock(io).require_confirmation(:confirm_upgrade)
        installer.get_destination_path
      end

      it "should set the destination path" do
        installer.destination_path.should == '/somewhere/chorus'
      end

      it "should set do_upgrade" do
        installer.do_upgrade.should be_true
      end
    end

    describe "when the user specifies a directory that can be upgraded from a legacy install" do
      let(:upgrade_legacy) { true }
      before do
        stub_input nil
      end

      it "should confirm legacy upgrade" do
        mock(installer).prompt_for_legacy_upgrade { installer.destination_path = 'foo' }
        mock(logger).logfile=('foo/install.log')
        installer.get_destination_path
      end
    end
  end

  describe "#prompt_for_legacy_upgrade" do
    subject { installer.prompt_for_legacy_upgrade }
    before do
      stub(installer).version { '2.2.0.0' }
      mock(io).require_confirmation(:confirm_legacy_upgrade)
      mock(installer).prompt_legacy_upgrade_destination
    end

    it "should set do_legacy_upgrade" do
      subject
      installer.do_legacy_upgrade.should be_true
    end

    it "should set the legacy installation path" do
      installer.destination_path = '/opt/chorus/thingy'
      subject
      installer.legacy_installation_path.should == '/opt/chorus/thingy'
    end
  end

  describe "#prompt_legacy_upgrade_destination" do
    subject { installer.prompt_legacy_upgrade_destination }

    it "should ask the user to specify a path to install 2.2" do
      mock(io).prompt_until(:legacy_destination_path) do |symbol, proc|
        proc.call(nil).should be_false
        proc.call('foo').should be_true
        "/home/chorus22"
      end
      subject
      installer.destination_path.should == "/home/chorus22"
    end

    describe "when the user types a relative path" do
      it "returns the expanded path" do
        mock(io).prompt_until(:legacy_destination_path) { "~/chorus" }
        subject
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
        mock(io).prompt_until(:select_os).times(prompt_times) do |symbol, proc|
          proc.call(nil).should be_false
          proc.call('1').should be_true
          proc.call('2').should be_true
          proc.call('3').should be_true
          proc.call('4').should be_true
          proc.call('a').should be_false
          result
        end
      end
      let(:prompt_times) { 1 }

      context "in silent mode" do
        let(:prompt_times) { 0 }

        before do
          stub(io).silent? { true }
        end

        it "should fail" do
          expect { installer.get_postgres_build }.to raise_error(InstallerErrors::InstallAborted, /Version not supported/)
        end
      end

      context "when the user selects redhat 5.5" do
        let(:result) { "1" }

        it "returns the RedHat 5.5 build" do
          installer.get_postgres_build.should == 'postgres-redhat5.5-9.1.4.tar.gz'
        end
      end

      context "when the user selects redhat 6.2" do
        let(:result) { "2" }

        it "returns the RedHat 6.2 build" do
          installer.get_postgres_build.should == 'postgres-redhat6.2-9.1.4.tar.gz'
        end
      end

      context "when the user selects suse" do
        let(:result) { "3" }

        it "returns the Suse 11 build" do
          installer.get_postgres_build.should == 'postgres-suse11-9.1.4.tar.gz'
        end
      end

      context "when the user selects abort" do
        let(:result) { "4" }

        it "should fail" do
          expect { installer.get_postgres_build }.to raise_error(InstallerErrors::InstallAborted, /Version not supported/)
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
      mock(FileUtils).cp_r('./chorus_installation/.', '/opt/chorus/releases/2.2.0.0', :preserve => true)
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
      FileUtils.touch './chorus_installation/config/chorus.defaults.yml'
    end

    it "should create chorus.yml.example in shared path" do
      File.exists?('/opt/chorus/shared/chorus.yml.example').should be_false
      installer.copy_config_files

      File.exists?('/opt/chorus/shared/chorus.yml.example').should be_true
    end

    context "chorus.yml" do
      context "when chorus.yml doesn't exist in shared path" do
        it "creates chorus.yml file in shared path" do
          File.exists?('/opt/chorus/shared/chorus.yml').should be_false
          installer.copy_config_files

          File.exists?('/opt/chorus/shared/chorus.yml').should be_true
        end
      end

      context "when chorus.yml file already exists in the shared path" do
        before do
          FileUtils.mkdir_p('/opt/chorus/shared')
          File.open('/opt/chorus/shared/chorus.yml', 'w') { |f| f.puts "some yaml stuff" }
        end

        it "should not overwrite existing chorus.yml" do
          installer.copy_config_files
          File.read('/opt/chorus/shared/chorus.yml').strip.should == "some yaml stuff"
        end
      end
    end

    context "when database.yml doesn't exist in shared path" do
      it "creates database.yml file in shared path" do
        File.exists?('/opt/chorus/shared/database.yml').should be_false
        installer.copy_config_files

        File.exists?('/opt/chorus/shared/database.yml').should be_true
      end
    end

    context "when database.yml exists in the shared path" do
      before do
        FileUtils.mkdir_p('/opt/chorus/shared')
        File.open('/opt/chorus/shared/database.yml', 'w') { |f| f.puts "some yaml stuff" }
      end

      it "should not overwrite existing database.yml" do
        installer.copy_config_files
        File.read('/opt/chorus/shared/database.yml').strip.should == "some yaml stuff"
      end
    end
  end

  describe "#link_services" do
    before do
      installer.destination_path = "/opt/chorus"
      stub_version
      FileUtils.mkdir_p(installer.destination_path)
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

    it "does not update database.yml if upgrading" do
      installer.do_upgrade = true
      installer.create_database_config

      YAML.load_file('/opt/chorus/shared/database.yml')['production']['password'].should == 'something'
    end
  end

  describe "#setup_database" do
    before do
      stub(installer).version { "2.2.0.0" }
      installer.destination_path = "/opt/chorus"
      installer.database_user = 'the_user'
      installer.database_password = 'secret'
      @call_order = []
      stub_chorus_exec(installer)
    end

    context "when installing fresh" do
      it "creates the database structure" do
        installer.setup_database
        @call_order.should == [:create_database, :start_postgres, :create_user, :rake_db_create, :rake_db_migrate, :rake_db_seed, :stop_postgres]
      end
    end

    context "when upgrading" do
      before do
        installer.do_upgrade = true
      end

      it "migrates the existing database" do
        installer.setup_database
        @call_order.should == [:start_postgres, :rake_db_migrate, :stop_postgres]
      end
    end
  end

  describe "#stop_old_install" do
    context "when installing fresh" do
      before do
        dont_allow(installer).system
      end

      it "should do nothing" do
        installer.stop_old_install
      end
    end

    context "when upgrading" do
      before do
        stub(installer).version { '2.2.0.0' }
        installer.do_upgrade = true
        installer.destination_path = '/opt/chorus'
        mock(installer).chorus_exec("CHORUS_HOME=/opt/chorus/current /opt/chorus/server_control.sh stop") { true }
      end

      it "should stop the previous version" do
        installer.stop_old_install
      end
    end
  end

  describe "#startup" do
    context "when installing fresh" do
      before do
        dont_allow(installer).system
      end

      it "should do nothing" do
        installer.startup
      end
    end

    context "when upgrading" do
      before do
        stub(installer).version { '2.2.0.0' }
        installer.do_upgrade = true
        installer.destination_path = '/opt/chorus'
        mock(installer).chorus_exec("CHORUS_HOME=/opt/chorus/releases/2.2.0.0 /opt/chorus/releases/2.2.0.0/packaging/server_control.sh start") { true }
      end

      it "should stop the previous version" do
        installer.startup
      end
    end
  end

  describe "#link_current_to_release" do
    before do
      installer.destination_path = "/opt/chorus"
      stub(installer).version { '2.2.0.0' }
      FileUtils.mkdir_p '/opt/chorus/releases/1.2.2.2'
    end

    it "creates a symlink to the new release from current" do
      installer.link_current_to_release

      File.readlink('/opt/chorus/current').should == '/opt/chorus/releases/2.2.0.0'
    end

    it "should overwrite an existing link" do
      FileUtils.ln_s("/opt/chorus/releases/1.2.2.2", "/opt/chorus/current")
      mock(File).delete("/opt/chorus/current") # FakeFS workaround
      installer.link_current_to_release

      File.readlink('/opt/chorus/current').should == '/opt/chorus/releases/2.2.0.0'
    end
  end

  describe "#extract_postgres" do
    before do
      stub_version
      installer.destination_path = "/opt/chorus"
    end

    it "calls tar to unpack postgres" do
      installer.instance_variable_set(:@postgres_package, 'postgres-blahblah.tar.gz')
      mock(installer).chorus_exec("tar xzf /opt/chorus/releases/2.2.0.0/packaging/postgres/postgres-blahblah.tar.gz -C /opt/chorus/releases/2.2.0.0/") { true }
      installer.extract_postgres
    end
  end

  describe "command execution" do
    before do
      installer.destination_path = '/opt/chorus'
      stub(installer).version { "2.2.0.0" }
    end

    it "raises an exception if exit code is different than zero" do
      mock(logger).capture_output("PATH=/opt/chorus/releases/2.2.0.0/postgres/bin:$PATH && silly command") { false }
      expect { installer.send(:chorus_exec, "silly command") }.to raise_error(InstallerErrors::CommandFailed)
    end
  end

  describe "#validate_non_root" do
    context "when the script is being run by root"
    it "raises an exception" do
      mock(Process).uid() { 0 }
      expect { installer.validate_non_root }.to raise_error(InstallerErrors::InstallAborted, /Please run the installer as a non-root user./)
    end

    context "when the script is not run as root" do
      it "does not raise an exception" do
        expect { installer.validate_non_root }.to_not raise_error()
      end
    end
  end

  describe "#validate_localhost" do
    context "when localhost is undefined"
    it "raises an exception" do
      mock(installer).system("ping -c 1 localhost > /dev/null") { false }
      expect { installer.validate_localhost }.to raise_error(InstallerErrors::InstallAborted, /Could not connect to 'localhost', please set in \/etc\/hosts/)
    end

    context "when localhost is defined" do
      it "does not raise an exception" do
        expect { installer.validate_localhost }.to_not raise_error()
      end
    end
  end

  describe "#dump_and_shutdown_legacy" do
    subject { installer.dump_and_shutdown_legacy }

    before do
      installer.legacy_installation_path = '/opt/old_chorus'
      installer.destination_path = '/opt/chorus'
      stub(installer).version { '2.2.0.0' }
      stub_chorus_exec(installer)

      @call_order = []
    end

    it "should dump the old database and shut it down" do
      subject
      @call_order.should == [:stop_old_app, :start_old_app, :pg_dump, :stop_old_app_or_fail]
    end
  end

  describe "#migrate_legacy_data" do
    subject { installer.migrate_legacy_data }

    before do
      installer.legacy_installation_path = '/opt/old_chorus'
      installer.destination_path = '/opt/chorus'
      stub(installer).version { '2.2.0.0' }

      @call_order = []

      mock(installer).start_postgres { @call_order << :start_new_postgres }
      stub_chorus_exec(installer)
    end

    it "should execute the data migrator" do
      subject
      @call_order.should == [:start_new_postgres, :import_legacy_schema, :legacy_migration]
    end
  end

  def stub_chorus_exec(installer)
    stub(installer).chorus_exec.with_any_args do |cmd|
      @call_order << :import_legacy_schema if cmd =~ /legacy_migrate_schema_setup\.sh/
      @call_order << :legacy_migration if cmd =~ /rake legacy:migrate/
      @call_order << :stop_old_app if cmd =~ /edcsvrctl stop; true/
      @call_order << :stop_old_app_or_fail if cmd =~ /edcsvrctl stop(?!; true)/
      @call_order << :start_old_app if cmd =~ /edcsvrctl start/
      @call_order << :pg_dump if cmd =~ /pg_dump/
      cmd =~ /rake/ and cmd.scan /db:(\S+)/ do |targets|
        @call_order << :"rake_db_#{targets[0]}"
      end
      @call_order << :start_postgres if cmd =~ /server_control\.sh start postgres/
      @call_order << :stop_postgres if cmd =~ /server_control\.sh stop postgres/
      @call_order << :create_user if cmd =~ /CREATE ROLE/
      @call_order << :create_database if cmd =~ /initdb/
    end
  end

  describe "#remove_and_restart_previous!" do
    before do
      stub(installer).version { "2.2.0.0" }
      installer.destination_path = "/opt/chorus"
      FileUtils.mkdir_p "/opt/chorus/releases/2.2.0.0"
    end

    it "should remove the release folder" do
      dont_allow(installer).chorus_exec
      installer.remove_and_restart_previous!
      File.exists?("/opt/chorus/releases/2.2.0.0").should == false
    end

    context "when upgrading" do
      before do
        installer.do_upgrade = true
        mock(installer).chorus_exec("CHORUS_HOME=/opt/chorus/current /opt/chorus/packaging/server_control.sh start")
      end

      it "should start up the old install" do
        installer.remove_and_restart_previous!
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

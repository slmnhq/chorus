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
    let(:default_path) { '/usr/local/greenplum-chorus' }
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
        installer.upgrade_existing?.should be_false
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

      it "should set upgrade_existing?" do
        installer.upgrade_existing?.should be_true
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

  describe "#get_data_path" do
    before do
      stub(installer).version { "2.2.0.1-8840ae71c" }
      installer.destination_path = destination_path
      stub(version_detector).can_upgrade_2_2?(anything) { do_2_2_upgrade }
    end
    let(:default_path) { "/data/greenplum-chorus" }
    let(:data_path) { '/large_disk/data/' }
    let(:destination_path) { '/destination' }
    let(:do_2_2_upgrade) { false }

    context "for a fresh install" do
      before do
        mock(io).prompt_or_default(:data_path, default_path) { data_path }
      end

      it "should set the data path when the user enters one" do
        installer.get_data_path
        installer.data_path.should == '/large_disk/data'
      end

      describe "when the user types a relative path" do
        let(:data_path) { "~/data" }
        it "returns the expanded path" do
          installer.get_data_path
          installer.data_path.should == "#{ENV['HOME']}/data"
        end
      end
    end

    context "When doing a 2_2 upgrade" do
      let(:do_2_2_upgrade) { true }

      it "should not prompt data directory" do
        installer.get_data_path
        installer.data_path.should == nil
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

    it "should set upgrade_legacy?" do
      subject
      installer.upgrade_legacy?.should be_true
    end

    it "should set the legacy installation path" do
      installer.destination_path = '/usr/local/greenplum-chorus/thingy'
      subject
      installer.legacy_installation_path.should == '/usr/local/greenplum-chorus/thingy'
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
    context "when Linux" do
      before do
        stub(installer).is_supported_mac? { false }
      end

      context "when Linux is CentOS/RHEL 5.5" do
        before do
          FileUtils.mkdir_p("/etc/")
          File.open("/etc/redhat-release", "w") { |f| f.puts "XXXXXXXXX release 5.5 (Final)" }
        end

        it "returns the RedHat 5.5 build" do
          installer.get_postgres_build.should == 'postgres-redhat5.5-9.2.1.tar.gz'
        end
      end

      context "when Linux is CentOS/RHEL 6.2" do
        before do
          FileUtils.mkdir_p("/etc/")
          File.open("/etc/redhat-release", "w") { |f| f.puts "XXXXXXXXX release 6.2 (Final)" }
        end

        it "returns the RedHat 6.2 build" do
          installer.get_postgres_build.should == 'postgres-redhat6.2-9.2.1.tar.gz'
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
          installer.get_postgres_build.should == 'postgres-suse11-9.2.1.tar.gz'
        end
      end
    end

    context "when OSX" do
      before do
        stub(installer).is_supported_mac? { true }
      end

      it "should return the OSX build" do
        installer.get_postgres_build.should == 'postgres-osx-9.2.1.tar.gz'
      end
    end

    context "when couldn't guess version/distribution" do
      before do
        stub(installer).is_supported_mac? { false }
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
          installer.get_postgres_build.should == 'postgres-redhat5.5-9.2.1.tar.gz'
        end
      end

      context "when the user selects redhat 6.2" do
        let(:result) { "2" }

        it "returns the RedHat 6.2 build" do
          installer.get_postgres_build.should == 'postgres-redhat6.2-9.2.1.tar.gz'
        end
      end

      context "when the user selects suse" do
        let(:result) { "3" }

        it "returns the Suse 11 build" do
          installer.get_postgres_build.should == 'postgres-suse11-9.2.1.tar.gz'
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
      installer.destination_path = "/usr/local/greenplum-chorus"

      FileUtils.mkpath './chorus_installation/'
      FileUtils.touch './chorus_installation/source_file_of_some_kind'
      stub_version
      mock(FileUtils).cp_r('./chorus_installation/.', '/usr/local/greenplum-chorus/releases/2.2.0.0', :preserve => true)
    end

    it "creates the correct release path" do
      installer.copy_chorus_to_destination
      File.directory?('/usr/local/greenplum-chorus/releases/2.2.0.0').should be_true
    end
  end

  describe "#create_shared_structure" do
    before do
      installer.destination_path = "/usr/local/greenplum-chorus"
    end

    it "creates the temporary folders" do
      installer.create_shared_structure

      File.directory?('/usr/local/greenplum-chorus/shared/tmp/pids').should be_true
    end

    it "creates the solr index data path" do
      installer.create_shared_structure

      File.directory?('/usr/local/greenplum-chorus/shared/solr/data').should be_true
    end

    it "create the logs path" do
      installer.create_shared_structure

      File.directory?('/usr/local/greenplum-chorus/shared/log').should be_true
    end

    it "creates the system file uploads path" do
      installer.create_shared_structure

      File.directory?('/usr/local/greenplum-chorus/shared/system').should be_true
    end
  end

  describe "#copy_config_files" do
    before do
      installer.destination_path = "/usr/local/greenplum-chorus"

      FileUtils.mkdir_p './chorus_installation/config'
      FileUtils.mkdir_p './chorus_installation/packaging'
      FileUtils.touch './chorus_installation/packaging/database.yml.example'
      FileUtils.touch './chorus_installation/config/chorus.yml.example'
      FileUtils.touch './chorus_installation/config/chorus.defaults.yml'
    end

    it "should create chorus.yml.example in shared path" do
      File.exists?('/usr/local/greenplum-chorus/shared/chorus.yml.example').should be_false
      installer.copy_config_files

      File.exists?('/usr/local/greenplum-chorus/shared/chorus.yml.example').should be_true
    end

    context "chorus.yml" do
      context "when chorus.yml doesn't exist in shared path" do
        it "creates chorus.yml file in shared path" do
          File.exists?('/usr/local/greenplum-chorus/shared/chorus.yml').should be_false
          installer.copy_config_files

          File.exists?('/usr/local/greenplum-chorus/shared/chorus.yml').should be_true
        end
      end

      context "when chorus.yml file already exists in the shared path" do
        before do
          FileUtils.mkdir_p('/usr/local/greenplum-chorus/shared')
          File.open('/usr/local/greenplum-chorus/shared/chorus.yml', 'w') { |f| f.puts "some yaml stuff" }
        end

        it "should not overwrite existing chorus.yml" do
          installer.copy_config_files
          File.read('/usr/local/greenplum-chorus/shared/chorus.yml').strip.should == "some yaml stuff"
        end
      end
    end

    context "when database.yml doesn't exist in shared path" do
      it "creates database.yml file in shared path" do
        File.exists?('/usr/local/greenplum-chorus/shared/database.yml').should be_false
        installer.copy_config_files

        File.exists?('/usr/local/greenplum-chorus/shared/database.yml').should be_true
      end
    end

    context "when database.yml exists in the shared path" do
      before do
        FileUtils.mkdir_p('/usr/local/greenplum-chorus/shared')
        File.open('/usr/local/greenplum-chorus/shared/database.yml', 'w') { |f| f.puts "some yaml stuff" }
      end

      it "should not overwrite existing database.yml" do
        installer.copy_config_files
        File.read('/usr/local/greenplum-chorus/shared/database.yml').strip.should == "some yaml stuff"
      end
    end
  end

  describe "#configure_secret_key" do
    before do
      installer.destination_path = "/usr/local/greenplum-chorus"

      FileUtils.mkdir_p './chorus_installation/config'
      FileUtils.mkdir_p './chorus_installation/packaging'
      FileUtils.touch './chorus_installation/packaging/database.yml.example'
      FileUtils.touch './chorus_installation/config/chorus.yml.example'
      FileUtils.touch './chorus_installation/config/chorus.defaults.yml'
      installer.copy_config_files
    end

    context "when key is not already present in shared" do
      let(:passphrase) { 'secret_key' }
      before do
        mock(installer).prompt_for_passphrase { passphrase }
      end
      it "generates the key from a passphrase and stores it in shared/secret.key" do
        installer.configure_secret_key
        File.read('/usr/local/greenplum-chorus/shared/secret.key').strip.should_not be_nil
      end
    end

    context "when key is already present" do
      let(:secret_key) { "its secret" }
      before do
        File.open('/usr/local/greenplum-chorus/shared/secret.key', 'w') { |f| f.puts secret_key }
      end

      it "does not change the existing key" do
        installer.configure_secret_key
        File.read('/usr/local/greenplum-chorus/shared/secret.key').strip.should == secret_key
      end
    end

    context "when the default key is used" do
      let(:passphrase) { 'secret_key' }
      before do
        mock(installer).prompt_for_passphrase.times(2) { "" }
      end

      it "generates a different random key on each run" do
        installer.configure_secret_key
        key1 = File.read('/usr/local/greenplum-chorus/shared/secret.key').strip
        File.delete('/usr/local/greenplum-chorus/shared/secret.key')
        installer.configure_secret_key
        key2 = File.read('/usr/local/greenplum-chorus/shared/secret.key').strip
        key1.should_not == key2
      end
    end
  end

  describe "#generate_paths_file" do
    before do
      installer.destination_path = "/usr/local/greenplum-chorus"
      FileUtils.mkdir_p installer.destination_path
    end

    it "generates a file with the CHORUS_HOME and PATH set" do
      installer.generate_paths_file
      lines = File.read("/usr/local/greenplum-chorus/chorus_path.sh").lines.to_a
      lines[0].chomp.should == "export CHORUS_HOME=#{installer.destination_path}"
      lines[1].chomp.should == "export PATH=$PATH:$CHORUS_HOME"
    end
  end

  describe "#link_services" do
    before do
      installer.destination_path = "/usr/local/greenplum-chorus"
      stub_version
      FileUtils.mkdir_p('/usr/local/greenplum-chorus/releases/2.2.0.0/packaging/')
      FileUtils.touch('/usr/local/greenplum-chorus/releases/2.2.0.0/packaging/chorus_path.sh')
      FileUtils.mkdir_p(installer.destination_path)
    end

    it "creates a symlink to chorus_control.sh" do
      installer.link_services

      File.readlink('/usr/local/greenplum-chorus/chorus_control.sh').should == '/usr/local/greenplum-chorus/releases/2.2.0.0/packaging/chorus_control.sh'
    end
  end

  describe "#link_shared_files" do
    before do
      installer.destination_path = destination_path
      installer.data_path = data_path
      stub_version
      installer.link_shared_files
    end

    let(:data_path) { "/data/chorus" }
    let(:destination_path) { "/usr/local/greenplum-chorus" }

    it "links the chorus.yml file" do
      File.readlink('/usr/local/greenplum-chorus/releases/2.2.0.0/config/chorus.yml').should == '/usr/local/greenplum-chorus/shared/chorus.yml'
    end

    it "links the database.yml file" do
      File.readlink('/usr/local/greenplum-chorus/releases/2.2.0.0/config/database.yml').should == '/usr/local/greenplum-chorus/shared/database.yml'
    end

    it "links the secret.key file" do
      File.readlink('/usr/local/greenplum-chorus/releases/2.2.0.0/config/secret.key').should == '/usr/local/greenplum-chorus/shared/secret.key'
    end

    it "links tmp" do
      File.readlink('/usr/local/greenplum-chorus/releases/2.2.0.0/tmp').should == '/usr/local/greenplum-chorus/shared/tmp'
    end

    it "creates data_path" do
      FileTest.exist?('/data/chorus/system').should be_true
    end

    it "links system" do
      File.readlink('/usr/local/greenplum-chorus/releases/2.2.0.0/system').should == '/usr/local/greenplum-chorus/shared/system'
      File.readlink('/usr/local/greenplum-chorus/shared/system').should == '/data/chorus/system'
    end

    it "links db" do
      File.readlink('/usr/local/greenplum-chorus/releases/2.2.0.0/postgres-db').should == '/usr/local/greenplum-chorus/shared/db'
      File.readlink('/usr/local/greenplum-chorus/shared/db').should == '/data/chorus/db'
    end

    it "links solr" do
      File.readlink('/usr/local/greenplum-chorus/releases/2.2.0.0/solr/data').should == '/usr/local/greenplum-chorus/shared/solr/data'
      File.readlink('/usr/local/greenplum-chorus/shared/solr/data').should == '/data/chorus/solr/data'
    end

    it "links log" do
      File.readlink('/usr/local/greenplum-chorus/releases/2.2.0.0/log').should == '/usr/local/greenplum-chorus/shared/log'
      File.readlink('/usr/local/greenplum-chorus/shared/log').should == '/data/chorus/log'
    end

    shared_examples "not link the data paths" do
      it "doesn't link system" do
        File.readlink('/usr/local/greenplum-chorus/releases/2.2.0.0/system').should == '/usr/local/greenplum-chorus/shared/system'
        File.symlink?('/usr/local/greenplum-chorus/shared/system').should be_false
      end

      it "doesn't link db" do
        File.readlink('/usr/local/greenplum-chorus/releases/2.2.0.0/postgres-db').should == '/usr/local/greenplum-chorus/shared/db'
        File.symlink?('/usr/local/greenplum-chorus/shared/db').should be_false
      end

      it "doesn't link solr" do
        File.readlink('/usr/local/greenplum-chorus/releases/2.2.0.0/solr/data').should == '/usr/local/greenplum-chorus/shared/solr/data'
        File.symlink?('/usr/local/greenplum-chorus/shared/solr/data').should be_false
      end

      it "doesn't link log" do
        File.readlink('/usr/local/greenplum-chorus/releases/2.2.0.0/log').should == '/usr/local/greenplum-chorus/shared/log'
        File.symlink?('/usr/local/greenplum-chorus/shared/log').should be_false
      end
    end

    context "when data_path is not set" do
      let(:data_path) { nil }
      it_should_behave_like "not link the data paths"
    end

    context "when data_path is set to the shared directory" do
      let(:data_path) { destination_path + "/shared" }
      it_should_behave_like "not link the data paths"
    end
  end

  describe "#create_database_config" do
    before do
      installer.destination_path = "/usr/local/greenplum-chorus"
      FileUtils.mkdir_p '/usr/local/greenplum-chorus/shared/'
      File.open('/usr/local/greenplum-chorus/shared/database.yml', 'w') do |f|
        f.puts({'production' => {'password' => 'something', 'username' => 'the_user'}}.to_yaml)
      end
    end

    it "writes a new random password to the database.yml" do
      installer.create_database_config
      installer.database_password.should_not == 'something'
      installer.database_password.length >= 10
      installer.database_user.should == 'the_user'

      YAML.load_file('/usr/local/greenplum-chorus/shared/database.yml')['production']['password'].should == installer.database_password
    end

    it "does not update database.yml if upgrading" do
      installer.install_mode = :upgrade_existing
      installer.create_database_config

      YAML.load_file('/usr/local/greenplum-chorus/shared/database.yml')['production']['password'].should == 'something'
    end
  end

  describe "#setup_database" do
    before do
      stub(installer).version { "2.2.0.0" }
      installer.destination_path = destination_path
      FileUtils.mkdir_p "#{destination_path}/shared"

      installer.database_user = 'the_user'
      installer.database_password = 'secret'
      installer.data_path = "/data/chorus"
      @call_order = []
      stub_chorus_exec(installer)
    end

    let(:destination_path) { "/usr/local/greenplum-chorus" }

    context "when installing fresh" do
      it "creates the database structure" do
        installer.setup_database
        @call_order.should == [:create_database, :start_postgres, :create_user, :rake_db_create, :rake_db_migrate, :rake_db_seed, :stop_postgres]
      end
    end

    context "when upgrading" do
      before do
        installer.install_mode = :upgrade_existing
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
        installer.install_mode = :upgrade_existing
        installer.destination_path = '/usr/local/greenplum-chorus'
        mock(installer).chorus_exec("CHORUS_HOME=/usr/local/greenplum-chorus/current /usr/local/greenplum-chorus/chorus_control.sh stop") { true }
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
        installer.install_mode = :upgrade_existing
        installer.destination_path = '/usr/local/greenplum-chorus'
        mock(installer).chorus_exec("CHORUS_HOME=/usr/local/greenplum-chorus/releases/2.2.0.0 /usr/local/greenplum-chorus/releases/2.2.0.0/packaging/chorus_control.sh start") { true }
      end

      it "should stop the previous version" do
        installer.startup
      end
    end
  end

  describe "#link_current_to_release" do
    before do
      installer.destination_path = "/usr/local/greenplum-chorus"
      stub(installer).version { '2.2.0.0' }
      FileUtils.mkdir_p '/usr/local/greenplum-chorus/releases/1.2.2.2'
    end

    it "creates a symlink to the new release from current" do
      installer.link_current_to_release

      File.readlink('/usr/local/greenplum-chorus/current').should == '/usr/local/greenplum-chorus/releases/2.2.0.0'
    end

    it "should overwrite an existing link" do
      FileUtils.ln_s("/usr/local/greenplum-chorus/releases/1.2.2.2", "/usr/local/greenplum-chorus/current")
      mock(File).delete("/usr/local/greenplum-chorus/current") # FakeFS workaround
      installer.link_current_to_release

      File.readlink('/usr/local/greenplum-chorus/current').should == '/usr/local/greenplum-chorus/releases/2.2.0.0'
    end
  end

  describe "#extract_postgres" do
    before do
      stub_version
      installer.destination_path = "/usr/local/greenplum-chorus"
    end

    it "calls tar to unpack postgres" do
      installer.instance_variable_set(:@postgres_package, 'postgres-blahblah.tar.gz')
      mock(installer).chorus_exec("tar xzf /usr/local/greenplum-chorus/releases/2.2.0.0/packaging/postgres/postgres-blahblah.tar.gz -C /usr/local/greenplum-chorus/releases/2.2.0.0/") { true }
      installer.extract_postgres
    end
  end

  describe "command execution" do
    before do
      installer.destination_path = '/usr/local/greenplum-chorus'
      stub(installer).version { "2.2.0.0" }
    end

    it "raises an exception if exit code is different than zero" do
      mock(logger).capture_output("PATH=/usr/local/greenplum-chorus/releases/2.2.0.0/postgres/bin:$PATH && silly command") { false }
      expect { installer.send(:chorus_exec, "silly command") }.to raise_error(InstallerErrors::CommandFailed)
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
      installer.destination_path = '/usr/local/greenplum-chorus'
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
      installer.destination_path = '/usr/local/greenplum-chorus'
      stub(installer).version { '2.2.0.0' }

      @call_order = []

      stub_chorus_exec(installer)
    end

    it "should execute the data migrator" do
      subject
      @call_order.should == [:import_legacy_schema]
    end
  end

  def stub_chorus_exec(installer)
    stub(installer).chorus_exec.with_any_args do |cmd|
      @call_order << :import_legacy_schema if cmd =~ /chorus_migrate/
      @call_order << :stop_old_app if cmd =~ /edcsvrctl stop; true/
      @call_order << :stop_old_app_or_fail if cmd =~ /edcsvrctl stop(?!; true)/
      @call_order << :start_old_app if cmd =~ /edcsvrctl start/
      @call_order << :pg_dump if cmd =~ /pg_dump/
      cmd =~ /rake/ and cmd.scan /db:(\S+)/ do |targets|
        @call_order << :"rake_db_#{targets[0]}"
      end
      @call_order << :start_postgres if cmd =~ /chorus_control\.sh start postgres/
      @call_order << :stop_postgres if cmd =~ /chorus_control\.sh stop postgres/
      @call_order << :create_user if cmd =~ /CREATE ROLE/
      @call_order << :create_database if cmd =~ /initdb/
    end
  end

  describe "#remove_and_restart_previous!" do
    before do
      stub(installer).version { "2.2.0.0" }
      installer.destination_path = "/usr/local/greenplum-chorus"
      FileUtils.mkdir_p "/usr/local/greenplum-chorus/releases/2.2.0.0"
    end

    context "when upgrading an existing 2.2 installation" do
      before do
        installer.install_mode = :upgrade_existing
        mock(installer).chorus_exec("CHORUS_HOME=/usr/local/greenplum-chorus/current /usr/local/greenplum-chorus/packaging/chorus_control.sh start")
      end

      it "starts up the old install" do
        installer.remove_and_restart_previous!
      end

      it "removes the release folder" do
        installer.remove_and_restart_previous!
        File.exists?("/usr/local/greenplum-chorus/releases/2.2.0.0").should == false
      end
    end

    context "when doing a legacy_upgrade or a fresh install" do
      before do
        installer.install_mode = :upgrade_legacy
        mock(installer).chorus_exec("CHORUS_HOME=/usr/local/greenplum-chorus/releases/2.2.0.0 /usr/local/greenplum-chorus/releases/2.2.0.0/packaging/chorus_control.sh stop postgres")
      end

      it "stops postgres" do
        installer.remove_and_restart_previous!
      end

      it "removes the release folder" do
        installer.remove_and_restart_previous!
        File.exists?("/usr/local/greenplum-chorus/releases/2.2.0.0").should == false
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

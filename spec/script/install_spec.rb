require_relative "../../packaging/install"
require 'fakefs/spec_helpers'

RSpec.configure do |config|
  config.mock_with :rr
end

describe "Install" do
  include FakeFS::SpecHelpers

  let(:installer) { Install.new('.', silent) }
  let(:silent) { false }
  before do
    ENV['CHORUS_HOME'] = nil
    stub(installer).prompt(anything)
  end

  describe "#get_destination_path" do
    context "silent install" do
      let(:silent) { true }

      it "should not prompt the user" do
        dont_allow(installer).prompt
        installer.get_destination_path
        installer.destination_path.should == '/opt/chorus'
      end
    end

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

    describe "when there is a CHORUS_HOME set" do
      before do
        ENV["CHORUS_HOME"] = install_dir + "/current"
      end
      let(:install_dir) { "/not/standard/dir" }

      it "should fall back to the CHORUS_HOME path when the user enters nothing" do
        mock(installer).prompt("#{Install::MESSAGES[:default_chorus_path]} [#{install_dir}]:")
        stub_input nil
        installer.get_destination_path
        installer.destination_path.should == install_dir
      end
    end

    describe "when the user specifies a directory that looks like a Chorus 2.2 install" do
      before do
        stub(installer).version { "2.2.0.1-8840ae71c" }
        stub_input nil
        FileUtils.mkdir_p("/opt/chorus/releases")
        installed_versions.each do |version|
          FileUtils.mkdir_p("/opt/chorus/releases/#{version}")
        end
      end

      context "but no versions are actually installed" do
        let(:installed_versions) { [] }

        it "should do a non-upgrade install" do
          dont_allow(installer).prompt("Existing version of Chorus detected. Upgrading will restart services.  Continue now? [y]:")
          installer.get_destination_path
          installer.do_upgrade.should be_false
        end
      end

      context "when there are only older version installed" do
        let(:installed_versions) { ["2.2.0.0-8840ae71c"] }

        context 'in silent mode' do
          let(:silent) { true }

          it "should set do_upgrade to true without user input" do
            dont_allow(installer).prompt
            installer.get_destination_path
            installer.do_upgrade.should be_true
          end
        end

        it "should prompt the user to confirm downtime for upgrade" do
          mock(installer).prompt("Existing version of Chorus detected. Upgrading will restart services.  Continue now? [y]:")
          installer.get_destination_path
        end

        [nil, 'y', 'yEs'].each do |input|
          context "when the user confirms upgrade with #{input}" do
            before do
              all_inputs = [nil, input]
              stub(installer).get_input { all_inputs.shift }
              installer.get_destination_path
            end

            it "should set the destination path" do
              installer.destination_path.should == '/opt/chorus'
            end

            it "should set do_upgrade" do
              installer.do_upgrade.should be_true
            end
          end
        end

        context "when the user cancels the upgrade" do
          before do
            all_inputs = [nil, 'this is not a yes']
            stub(installer).get_input { all_inputs.shift }
          end

          it "should raise to cancel the install" do
            expect { installer.get_destination_path }.to raise_error(Install::UpgradeCancelled)
          end
        end
      end

      context "when the installed version is newer" do
        let(:installed_versions) { ["2.2.0.2-8840ae71c", "2.2.0.0-8840ae71c"] }

        it "should notify the user and fail" do
          expect { installer.get_destination_path }.to raise_error(Install::InvalidVersion)
        end
      end

      context "When the installed version is equal" do
        let(:installed_versions) { ["2.2.0.1-8840ae71c"] }

        it "should notify the user and fail" do
          expect { installer.get_destination_path }.to raise_error(Install::AlreadyInstalled)
        end
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

      context "in silent mode" do
        let(:silent) { true }
        let(:prompt_times) { 0 }

        it "should fail" do
          expect { installer.get_postgres_build }.to raise_error(Install::InvalidOperatingSystem)
        end
      end

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
          expect { installer.get_postgres_build }.to raise_error(Install::InvalidOperatingSystem)
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
      mock(installer).chorus_exec("CHORUS_HOME=/opt/chorus/releases/2.2.0.0 /opt/chorus/releases/2.2.0.0/packaging/server_control.sh start postgres") { @call_order << 'start' }
      mock(installer).chorus_exec("CHORUS_HOME=/opt/chorus/releases/2.2.0.0 /opt/chorus/releases/2.2.0.0/packaging/server_control.sh stop postgres") { @call_order << 'stop' }
    end

    context "when installing fresh" do
      before do
        mock(installer).chorus_exec("/opt/chorus/releases/2.2.0.0/postgres/bin/initdb --locale=en_US.UTF-8 /opt/chorus/shared/db") { @call_order << "create_database" }
        mock(installer).chorus_exec(%Q{/opt/chorus/releases/2.2.0.0/postgres/bin/psql -d postgres -p8543 -h 127.0.0.1 -c "CREATE ROLE the_user PASSWORD 'secret' SUPERUSER CREATEDB CREATEROLE INHERIT LOGIN"}) { @call_order << "create_user" }
        mock(installer).chorus_exec("cd /opt/chorus/releases/2.2.0.0 && RAILS_ENV=production bin/rake db:create db:migrate db:seed") { @call_order << "migrate" }
      end

      it "creates the database structure" do
        installer.setup_database
        @call_order.should == ["create_database", "start", "create_user", "migrate", "stop"]
      end
    end

    context "when upgrading" do
      before do
        installer.do_upgrade = true
        mock(installer).chorus_exec("cd /opt/chorus/releases/2.2.0.0 && RAILS_ENV=production bin/rake db:migrate") { @call_order << "migrate" }
      end

      it "should migrate the existing database" do
        installer.setup_database
        @call_order.should == %w(start migrate stop)
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
      mock(installer).system("PATH=/opt/chorus/releases/2.2.0.0/postgres/bin:$PATH && silly command >> /opt/chorus/install.log 2>&1") { false }
      expect { installer.send(:chorus_exec, "silly command") }.to raise_error(Install::CommandFailed)
    end
  end

  describe "#validate_non_root" do
    context "when the script is being run by root"
    it "raises an exception" do
      mock(Process).uid() { 0 }
      expect { installer.validate_non_root }.to raise_error(Install::NonRootValidationError)
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
      expect { installer.validate_localhost }.to raise_error(Install::LocalhostUndefined)
    end

    context "when localhost is defined" do
      it "does not raise an exception" do
        expect { installer.validate_localhost }.to_not raise_error()
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

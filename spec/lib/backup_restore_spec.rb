require 'spec_helper'
require 'fakefs/spec_helpers'
require 'timecop'

require 'backup_restore'
require 'pathname'

describe 'BackupRestore' do
  include FakeFS::SpecHelpers
  before do
    stub(FileUtils).chmod.with(0755,anything) {}
  end

  describe 'Backup' do
    describe ".backup" do
      before do
        # stub out system calls
        any_instance_of(BackupRestore::Backup) do |instance|
          stub(instance).log.with_any_args
          stub(instance).dump_database { touch "database.sql.gz" }
          stub(instance).compress_assets { touch "assets.tgz" }
          stub(instance).capture_output.with_any_args do |cmd|
            touch $1 if /tar cf (\S+)/ =~ cmd
            true
          end
        end

        FakeFS::FileSystem.clone "#{Rails.root}/config"
        touch "#{Rails.root}/version_build"
        FileUtils.mkdir_p File.expand_path(backup_path)
      end

      let(:backup_path) { Pathname.new "backup_path" }
      let(:rolling_days) { 3 }

      def run_backup

        Timecop.freeze do
          BackupRestore.backup backup_path, rolling_days
          @expected_backup_file = File.expand_path backup_path.join(backup_filename(Time.current))
        end
      end

      it "creates the backup directory if it does not exist" do
        backup_dir = File.expand_path backup_path
        FileUtils.rm_rf backup_dir
        Dir.exists?(backup_dir).should be_false
        run_backup
        Dir.exists?(backup_dir).should be_true
      end

      it "creates a backup file with the correct timestamp" do
        run_backup
        File.exists?(@expected_backup_file).should be_true
      end

      it "creates only the backup file and leaves no other trace" do
        new_files_created_by do
          run_backup
        end.should == [@expected_backup_file]
      end

      context "when a system command fails" do
        it "cleans up all the files it created" do
          any_instance_of(BackupRestore::Backup) do |instance|
            stub(instance).capture_output.with_any_args { |cmd| raise "you can't do that!" if /tar/ =~ cmd }
          end
          new_files_created_by do
            expect {
              run_backup
            }.to raise_error("you can't do that!")
          end.should == []
        end
      end

      it "requires a positive integer for the number of rolling days" do
        expect {
          BackupRestore.backup backup_path, 0
        }.to raise_error(/positive integer/)
      end

      describe "rolling backups: " do
        let(:old_backup) { backup_path.join backup_filename(old_backup_time) }
        let(:rolling_days) { nil }

        before do
          touch old_backup
          BackupRestore.backup *[backup_path, rolling_days].compact
        end

        context "when rolling days parameter is provided" do

          let(:rolling_days) { 11 }

          context "when the old backup was created more than the stated time ago" do
            let(:old_backup_time) { rolling_days.days.ago - 1.hour }

            it "deletes it" do
              File.exists?(old_backup).should be_false
            end
          end

          context "when old backup was created within stated time" do
            let(:old_backup_time) { rolling_days.days.ago + 1.hour }

            it "keeps it" do
              File.exists?(old_backup).should be_true
            end
          end
        end

        context "when rolling days parameter is not provided" do

          let(:rolling_days) { nil }
          let(:old_backup_time) { 1.year.ago }

          it "does not remove old backups" do
            File.exists?(old_backup).should be_true
          end
        end
      end
    end

    def new_files_created_by
      entries_before_block = all_filesystem_entries("/")
      yield
      all_filesystem_entries("/") - entries_before_block
    end

    def backup_filename(time)
      "greenplum_chorus_backup_" + time.strftime('%Y%m%d_%H%M%S') + ".tar"
    end
  end

  describe 'Restore' do
    self.use_transactional_fixtures = false

    before do
      FakeFS.deactivate!
      any_instance_of(BackupRestore::Restore) do |instance|
        stub(instance).log.with_any_args
        stub(instance).restore_database
        stub(instance).restore_assets
      end
    end

    describe ".restore" do
      let(:chorus_path) { @tmp_path.join "chorus" }
      let(:backup_path) { @tmp_path.join "backup" }
      let(:current_version_string) {"0.2.0.0-1d012455"}
      let(:backup_version_string) { current_version_string }
      let(:backup_tar) { backup_path.join "backup.tar" }

      around do |example|
        make_tmp_path("rspec_backup_restore") do |tmp_path|
          @tmp_path = tmp_path

          Dir.mkdir chorus_path and Dir.chdir chorus_path do
            create_version_build(current_version_string)
          end

          Dir.mkdir backup_path and Dir.chdir backup_path do
            create_version_build(backup_version_string)
            system "echo database | gzip > database.sql.gz"
            system "tar cf #{backup_tar} version_build database.sql.gz"
          end

          Dir.chdir chorus_path do
            example.call
          end
        end
      end

      xit "restores the backed-up data" do
        BackupRestore.restore backup_tar, true
      end

      xit "works with relative paths" do
        BackupRestore.restore "../backup/backup.tar", true
      end

      context "when the backup file does not exist" do
        it "raises an exception" do
          capture(:stderr) do
            expect {
              BackupRestore.restore "missing_backup.tar", true
            }.to raise_error "Could not unpack backup file 'missing_backup.tar'"
          end.should include "Could not unpack backup file 'missing_backup.tar'"
        end
      end

      context "when the restore is not run in rails root directory" do
        before do
          sub_dir = chorus_path.join 'sub_dir'
          FileUtils.mkdir_p sub_dir
          Dir.chdir sub_dir
        end

        #it "still unpacks files in the root directory and returns to the starting directory" do
        #  mock(BackupRestore).system.with_any_args do |*args|
        #    current_directory_should_be(chorus_dir)
        #    Kernel.send :system, *args
        #    true
        #  end
        #  stub(Rails).root { Pathname.new chorus_dir }
        #  expect {
        #    BackupRestore.restore backup_tar
        #  }.not_to change(Dir, :pwd)
        #end
      end

      context "when the backup version doesn't match the current version" do
        let(:backup_version_string) { current_version_string + " not!" }

        xit "raises an exception" do
          expect {
            BackupRestore.restore backup_tar, true
          }.to raise_error(/differs from installed chorus version/)
        end
      end

      def current_directory_should_be(dir)
        current_dir = Dir.pwd
        Dir.chdir(dir) do
          Dir.pwd.should == current_dir
        end
      end
    end
  end

  # need this because File.touch doesn't exist in FakeFS
  def touch(filename)
    File.open(filename, 'w') {}
  end
end

describe "Backup and Restore" do
  include Deployment
  self.use_transactional_fixtures = false

  before do
    any_instance_of(BackupRestore::Backup) do |backup|
      stub(backup).log.with_any_args
    end
    any_instance_of(BackupRestore::Restore) do |restore|
      #stub(restore).restore_database
      stub(restore).log.with_any_args
    end
  end

  around do |example|
    # create fake original and restored install
    make_tmp_path("rspec_backup_restore_original") do |original_path|
      make_tmp_path("rspec_backup_restore_restored") do |restore_path|
        @original_path = original_path
        @restore_path = restore_path

        # populate original directory from development tree
        populate_chorus_install @original_path

        # create a fake asset in original
        stub(Rails).root { @original_path }
        chorus_config = ChorusConfig.new
        asset_path = Rails.root.join chorus_config['image_storage'].gsub(":rails_root/", "")
        FileUtils.mkdir_p asset_path.join "users"
        FileUtils.touch "#{asset_path}/users/asset_file.icon"

        # populate restore target with just config directory minus chorus.yml
        populate_chorus_install @restore_path

        # remove chorus.yml file from restore dir so we can replace it later
        FileUtils.rm @restore_path.join "config/chorus.yml"

        example.call
      end
    end
  end

  def populate_chorus_install(install_path)
    FileUtils.cp_r Rails.root.join("config"), install_path
    Dir.chdir install_path do
      create_version_build("0.2.0.0-1d012455")
    end
  end

  it "backs up and restores the data" do
    make_tmp_path("rspec_backup_restore_backup") do |backup_path|
      with_rails_root @original_path do
        BackupRestore.backup backup_path
      end

      backup_filename = Dir.glob(backup_path.join "*.tar").first

      deleted_user = User.first.delete
      all_models_before_restore = all_models

      with_rails_root @restore_path do
        BackupRestore.restore backup_filename, true
      end

      original_entries = get_filesystem_entries_at_path @original_path
      restored_entries = get_filesystem_entries_at_path @restore_path

      restored_entries.should == original_entries

      User.find_by_id(deleted_user.id).should == deleted_user

      all_models.should == all_models_before_restore
    end
  end

  def all_models
    ActiveRecord::Base.subclasses.map(&:unscoped).map(&:all).flatten.map(&:reload).group_by(&:class).inject({}) do |hash, (key, value)|
      hash[key] = value.map(&:attributes)
      hash
    end
  end

  def with_rails_root(root)
    original_rails_root = Rails.root
    stub(Rails).root { Pathname.new root }
    yield
  ensure
    stub(Rails).root { original_rails_root }
  end

  def get_filesystem_entries_at_path(path)
    pathname = Pathname.new(path)
    all_filesystem_entries(path).map do |entry|
      Pathname.new(entry).relative_path_from(pathname).to_s
    end.sort.uniq
  end
end

def create_version_build(version_string)
  File.open "version_build", "w" do |file|
    file.puts version_string
  end
end

def make_tmp_path(*args)
  SafeMktmpdir.mktmpdir *args do |tmp_dir|
    yield Pathname.new tmp_dir
  end
end

def all_filesystem_entries(path)
  path = Pathname.new(path)
  %w{. **/ **/*}.map do |wildcard|
    Dir.glob path.join wildcard
  end.flatten.sort.uniq
end

require 'stringio'

def capture(*streams)
  streams.map! { |stream| stream.to_s }
  begin
    result = StringIO.new
    streams.each { |stream| eval "$#{stream} = result" }
    yield
  ensure
    streams.each { |stream| eval("$#{stream} = #{stream.upcase}") }
  end
  result.string
end
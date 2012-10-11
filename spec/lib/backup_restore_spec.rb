require 'spec_helper'
require 'fakefs/spec_helpers'
require 'timecop'

require 'backup_restore'

include SafeMktmpdir

describe 'BackupRestore' do
  include FakeFS::SpecHelpers

  describe 'Backup' do
    describe ".backup" do
      before do
        # stub out system calls
        any_instance_of(BackupRestore::Backup) do |instance|
          stub(instance).log
          stub(instance).dump_database { touch "database.sql.gz" }
          stub(instance).compress_assets { touch "assets.tgz" }
          stub(instance).capture_output.with_any_args do |cmd|
            touch $1 if /tar cf (\S+)/ =~ cmd
            true
          end
        end

        FakeFS::FileSystem.clone "#{Rails.root}/config"
        touch "#{Rails.root}/version_build"
        FileUtils.mkdir_p File.expand_path(backup_dir)
      end

      let(:backup_dir) { "backup_dir" }
      let(:rolling_days) { 3 }

      def run_backup
        Timecop.freeze do
          BackupRestore.backup backup_dir, rolling_days
          @expected_backup_file = File.expand_path File.join(backup_dir, backup_filename(Time.current))
        end
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

      context "when the backup directory does not exist" do
        it "raises an exception" do
          expect {
            BackupRestore.backup "missing_dir"
          }.to raise_error(/missing/)
        end
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
          BackupRestore.backup backup_dir, 0
        }.to raise_error(/positive integer/)
      end

      describe "rolling backups: " do
        let(:old_backup) { File.join backup_dir, backup_filename(old_backup_time) }
        let(:rolling_days) { nil }

        before do
          touch old_backup
          BackupRestore.backup *[backup_dir, rolling_days].compact
        end

        shared_examples_for "it deletes backups older than" do |expected_rolling_days|
          before do
            expected_rolling_days /= 1.day
          end

          context "when the old backup was created more than the stated time ago" do
            let(:old_backup_time) { expected_rolling_days.days.ago - 1.hour }

            it "deletes it" do
              File.exists?(old_backup).should be_false
            end
          end

          context "when old backup was created within stated time" do
            let(:old_backup_time) { expected_rolling_days.days.ago + 1.hour }

            it "keeps it" do
              File.exists?(old_backup).should be_true
            end
          end
        end

        it_should_behave_like "it deletes backups older than", 7.days

        context "when rolling days parameter is provided" do

          let(:rolling_days) { 11 }

          it_should_behave_like "it deletes backups older than", 11.days
        end
      end
    end

    def new_files_created_by
      entries_before_block = all_filesystem_entries
      yield
      all_filesystem_entries - entries_before_block
    end

    def all_filesystem_entries
      (Dir.glob('/**/**/') + Dir.glob('/**/**') + Dir.glob('/**/') + Dir.glob('/**') + Dir.glob('/*')).uniq
    end

    def backup_filename(time)
      "greenplum_chorus_backup_" + time.strftime('%Y%m%d_%H%M%S') + ".tar"
    end
  end

  describe 'Restore' do
    before do
      FakeFS.deactivate!
      any_instance_of(BackupRestore::Restore) do |instance|
        #stub(instance).log
        stub(instance).restore_database
        stub(instance).restore_assets
      end
    end

    #describe ".restore" do
    #  let(:chorus_dir) { File.join @tmp_dir, "chorus" }
    #  let(:backup_dir) { File.join @tmp_dir, "backup" }
    #  let(:current_version_string) {"0.2.0.0-1d012455"}
    #  let(:backup_version_string) { current_version_string }
    #  let(:backup_tar) { File.join backup_dir, "backup.tar" }
    #
    #  around do |example|
    #    mktmpdir("rspec_backup_restore") do |tmp_dir|
    #      @tmp_dir = tmp_dir
    #
    #      Dir.mkdir chorus_dir and Dir.chdir chorus_dir do
    #        create_version_build(current_version_string)
    #      end
    #
    #      Dir.mkdir backup_dir and Dir.chdir backup_dir do
    #        create_version_build(backup_version_string)
    #        system "echo database | gzip > database.sql.gz"
    #        system "tar cf #{backup_tar} version_build database.sql.gz"
    #      end
    #
    #      Dir.chdir chorus_dir do
    #        example.call
    #      end
    #    end
    #  end
    #
    #  it "restores the backed-up data" do
    #    BackupRestore.restore backup_tar
    #  end
    #
    #  it "works with relative paths" do
    #    BackupRestore.restore "../backup/backup.tar"
    #  end
    #
    #  context "when the backup file does not exist" do
    #    it "raises an exception" do
    #      expect {
    #        BackupRestore.restore "missing_backup.tar"
    #      }.to raise_error("Could not unpack backup file 'missing_backup.tar'")
    #    end
    #  end
    #
    #  #context "when the restore is not run in rails root directory" do
      #  before do
      #    sub_dir = File.join(chorus_dir, 'sub_dir')
      #    FileUtils.mkdir_p sub_dir
      #    Dir.chdir sub_dir
      #  end
      #
      #  it "still unpacks files in the root directory and returns to the starting directory" do
      #    mock(BackupRestore).system.with_any_args do |*args|
      #      current_directory_should_be(chorus_dir)
      #      Kernel.send :system, *args
      #      true
      #    end
      #    stub(Rails).root { chorus_dir }
      #    expect {
      #      BackupRestore.restore backup_tar
      #    }.not_to change(Dir, :pwd)
      #  end
      #end

      #context "when the backup version doesn't match the current version" do
      #  let(:backup_version_string) { current_version_string + " not!" }
      #
      #  it "raises an exception" do
      #    expect {
      #      BackupRestore.restore backup_tar
      #    }.to raise_error(/differs from installed chorus version/)
      #  end
      #end
      #
      #def create_version_build(version_string)
      #  File.open "version_build", "w" do |file|
      #    file.puts version_string
      #  end
      #end

      #def current_directory_should_be(dir)
      #  current_dir = Dir.pwd
      #  Dir.chdir(dir) do
      #    Dir.pwd.should == current_dir
      #  end
      #end
    #end
  end

  # need this because File.touch doesn't exist in FakeFS
  def touch(filename)
    File.open(filename, 'w') {}
  end
end

describe "deployment" do
  include Deployment

  xit "backs up and restores the data" do
    mktmpdir("rspec_backup_restore") do |tmp_dir|
      BackupRestore.backup(tmp_dir)
      #p `tar tvf #{tmp_dir}/*`
    end
  end
end

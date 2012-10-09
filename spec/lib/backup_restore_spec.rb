require 'spec_helper'
require 'fakefs/spec_helpers'
require 'timecop'

require 'backup_restore'

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
          stub(instance).system.with_any_args do |cmd|
            touch $1 if /tar cf (\S+)/ =~ cmd
            true
          end
        end

        FakeFS::FileSystem.clone "#{Rails.root}/config"
        touch "#{Rails.root}/version_build"
        FileUtils.mkdir_p File.expand_path(backup_dir)
      end

      let(:backup_dir) {"backup_dir"}
      let(:rolling_days) {3}

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
            stub(instance).system.with_any_args { |cmd| raise "you can't do that!"  if /tar/ =~ cmd }
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
        let(:old_backup) {File.join backup_dir, backup_filename(old_backup_time)}
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

    # need this because File.touch doesn't exist in FakeFS
    def touch(filename)
      File.open(filename, 'w') {}
    end
  end
end

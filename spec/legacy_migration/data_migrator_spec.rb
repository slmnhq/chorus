require 'legacy_migration_spec_helper'

describe DataMigrator do
  describe ".migrate" do
    it "migrates and validates all without blowing up" do
      any_instance_of(WorkfileMigrator::LegacyFilePath) do |p|
        # Stub everything with a PNG so paperclip doesn't blow up
        stub(p).path { File.join(Rails.root, "spec/fixtures/small2.png") }
      end

      mock.proxy(InstanceAccountMigrator).migrate.any_number_of_times
      mock.proxy(ImageMigrator).migrate.any_number_of_times
      mock.proxy(SandboxMigrator).migrate.any_number_of_times
      mock.proxy(AssociatedDatasetMigrator).migrate.any_number_of_times
      mock.proxy(ActivityMigrator).migrate.with(anything).any_number_of_times
      mock.proxy(NoteMigrator).migrate.with(anything).any_number_of_times
      mock.proxy(NotificationMigrator).migrate.with(anything).any_number_of_times

      mock.proxy(ActivityMigrator).validate
      mock.proxy(AssociatedDatasetMigrator).validate
      mock.proxy(DatabaseObjectMigrator).validate
      mock.proxy(HadoopInstanceMigrator).validate
      mock.proxy(HdfsEntryMigrator).validate
      mock.proxy(InstanceAccountMigrator).validate
      mock.proxy(GpdbInstanceMigrator).validate
      mock.proxy(MembershipMigrator).validate
      mock.proxy(AttachmentMigrator).validate
      mock.proxy(NoteMigrator).validate
      mock.proxy(NotificationMigrator).validate
      mock.proxy(UserMigrator).validate
      mock.proxy(WorkfileMigrator).validate
      mock.proxy(WorkspaceMigrator).validate
      

      DataMigrator.migrate_all(SPEC_WORKFILE_PATH)
    end
  end
end

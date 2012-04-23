require 'spec_helper'

describe DataMigrator, :type => :data_migration do
  describe ".migrate" do
    it "calls each migrator" do
      UserMigrator.should_receive(:migrate)
      InstanceMigrator.should_receive(:migrate)
      InstanceCredentialMigrator.should_receive(:migrate)
      DataMigrator.migrate
    end
  end
end
require 'spec_helper'

describe DataMigrator, :type => :data_migration do
  describe ".migrate" do
    it "calls the user migrator" do
      UserMigrator.should_receive(:migrate)
      DataMigrator.migrate
    end
  end
end
require 'spec_helper'

describe DatabaseMigrator, :legacy_migration => true, :type => :legacy_migration do
  describe ".migrate" do
    before(:each) do
      UserMigrator.new.migrate
      InstanceMigrator.new.migrate
      InstanceAccountMigrator.new.migrate
    end

    it "populates the gpdb_database and gpdb_schema table" do
      GpdbDatabase.count.should == 0
      GpdbSchema.count.should == 0

      DatabaseMigrator.new.migrate

      GpdbDatabase.count.should > 0
      GpdbSchema.count.should > 0
    end
  end
end

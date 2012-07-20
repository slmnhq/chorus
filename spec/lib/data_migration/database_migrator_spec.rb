require 'spec_helper'

describe DatabaseMigrator, :data_migration => true, :type => :data_migration do
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

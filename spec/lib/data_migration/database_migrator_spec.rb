require 'spec_helper'

describe DatabaseMigrator, :type => :data_migration do
  describe ".migrate" do
    before(:each) do
      UserMigrator.new.migrate
      InstanceMigrator.new.migrate
      InstanceAccountMigrator.new.migrate
    end

    it "populates the gpdb_database table" do
      GpdbDatabase.all.count() == 0
      DatabaseMigrator.new.migrate
      GpdbDatabase.all.count().should > 0
    end

    it "populates the gpdb_schema table" do
      GpdbSchema.all.count() == 0
      DatabaseMigrator.new.migrate
      GpdbSchema.all.count().should > 0
    end
  end
end
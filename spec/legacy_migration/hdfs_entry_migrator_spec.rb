require 'legacy_migration_spec_helper'

describe HdfsEntryMigrator do
  before :all do
    HdfsEntryMigrator.migrate
  end

  describe ".migrate" do
    it "should migrate the hdfs references found in the edc_comment table to the new database" do
      count = 0
      Legacy.connection.select_all("
        SELECT DISTINCT ec.entity_id
        FROM edc_comment ec
        WHERE entity_type = 'hdfs'
      ").each do |legacy_row|
        count += 1
        legacy_hadoop_instance_id, path = legacy_row["entity_id"].split("|")
        hadoop_instance = HadoopInstance.find_by_legacy_id!(legacy_hadoop_instance_id)
        HdfsEntry.find_by_hadoop_instance_id_and_path(hadoop_instance.id, path).should_not be_nil
      end
      HdfsEntry.where(:is_directory => false).count.should == count
      HdfsEntry.count.should > count
    end

    it "is idempotent" do
      count = HdfsEntry.unscoped.count
      HdfsEntryMigrator.migrate
      HdfsEntry.unscoped.count.should == count
    end
  end
end
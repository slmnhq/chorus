require 'legacy_migration_spec_helper'

describe AssociatedDatasetMigrator do

  before :all do
    AssociatedDatasetMigrator.migrate
  end

  describe ".migrate" do
    LEGACY_ASSOCIATED_DATASETS_SQL = <<-SQL
      SELECT
        edc_dataset.*
      FROM edc_dataset
      LEFT JOIN edc_instance
        ON edc_dataset.instance_id = edc_instance.id
      where edc_dataset.is_deleted = false
    SQL

    describe "copying the data" do
      it "creates new associated dataset from legacy associated datasets and is idempotent" do
        legacy_datasets = Legacy.connection.select_all(LEGACY_ASSOCIATED_DATASETS_SQL)
        AssociatedDataset.count.should == legacy_datasets.count
        AssociatedDatasetMigrator.migrate
        AssociatedDataset.count.should == legacy_datasets.count
      end

      it "copies the correct data fields from the legacy associated dataset" do
        legacy_datasets = Legacy.connection.select_all(LEGACY_ASSOCIATED_DATASETS_SQL)
        AssociatedDataset.count.should == legacy_datasets.count
        legacy_datasets.each do |legacy_associated_dataset|
          associated_dataset = AssociatedDataset.unscoped.find_by_legacy_id(legacy_associated_dataset["id"])

          associated_dataset.workspace.should == Workspace.find_by_legacy_id(legacy_associated_dataset['workspace_id'])
          associated_dataset.dataset.name.should start_with(legacy_associated_dataset['object_name'])
          associated_dataset.dataset.schema.name.should == legacy_associated_dataset['schema_name']
          associated_dataset.dataset.schema.database.name.should == legacy_associated_dataset['database_name']
          associated_dataset.dataset.schema.database.gpdb_instance.legacy_id.should == legacy_associated_dataset['instance_id']
        end
      end
    end
  end
end

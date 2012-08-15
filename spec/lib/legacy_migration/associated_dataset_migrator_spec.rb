require 'spec_helper_no_transactions'

describe AssociatedDatasetMigrator do

  before :all do
    AssociatedDatasetMigrator.new.migrate
  end

  describe ".migrate" do
    LEGACY_ASSOCIATED_DATASETS_SQL = <<-SQL
      SELECT
        edc_dataset.*
      FROM edc_dataset
      LEFT JOIN edc_instance
        ON edc_dataset.instance_id = edc_instance.id
    SQL

    describe "copying the data" do
      it "creates new associated dataset from legacy associated datasets and is idempotent" do
        AssociatedDataset.count.should == 14
        AssociatedDatasetMigrator.new.migrate
        AssociatedDataset.count.should == 14
      end

      it "copies the correct data fields from the legacy associated dataset" do
        Legacy.connection.select_all(LEGACY_ASSOCIATED_DATASETS_SQL).each do |legacy_associated_dataset|
          next if legacy_associated_dataset['type'] == 'CHORUS_VIEW'
   
          associated_dataset = AssociatedDataset.unscoped.find_by_legacy_id(legacy_associated_dataset["id"])

          associated_dataset.workspace.should == Workspace.find_by_legacy_id(legacy_associated_dataset['workspace_id'])
          associated_dataset.dataset.name.should == legacy_associated_dataset['object_name']
          associated_dataset.dataset.schema.name.should == legacy_associated_dataset['schema_name']
          associated_dataset.dataset.schema.database.name.should == legacy_associated_dataset['database_name']
          associated_dataset.dataset.schema.database.instance.legacy_id.should == legacy_associated_dataset['instance_id']
        end
      end
    end
  end
end

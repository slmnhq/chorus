require 'spec_helper_no_transactions'

describe AssociatedDatasetMigrator do

  before :all do
    UserMigrator.new.migrate if User.count == 0
    InstanceMigrator.new.migrate if Instance.count == 0
    InstanceAccountMigrator.new.migrate if InstanceAccount.count == 0
    WorkspaceMigrator.new.migrate if Workspace.count == 0
    AssociatedDatasetMigrator.new.migrate if AssociatedDataset.count == 0
  end

  describe ".migrate" do
    LEGACY_ASSOCIATED_DATASETS_SQL = <<-SQL
      SELECT
        edc_dataset.*,
        edc_instance.chorus_rails_instance_id
      FROM edc_dataset
      LEFT JOIN edc_instance
        ON edc_dataset.instance_id = edc_instance.id
    SQL

    describe "copying the data" do
      it "creates new associated dataset from legacy associated datasets" do
        AssociatedDataset.count.should == 14
      end

      it "copies the correct data fields from the legacy associated dataset" do
        Legacy.connection.select_all(LEGACY_ASSOCIATED_DATASETS_SQL).each do |legacy_associated_dataset|
          next if legacy_associated_dataset['type'] == 'CHORUS_VIEW'
          if(!legacy_associated_dataset["chorus_rails_associated_dataset_id"])
            puts legacy_associated_dataset
          end
          associated_dataset = AssociatedDataset.unscoped.find(legacy_associated_dataset["chorus_rails_associated_dataset_id"])

          associated_dataset.workspace.should == Workspace.find_by_legacy_id(legacy_associated_dataset['workspace_id'])
          associated_dataset.dataset.name.should == legacy_associated_dataset['object_name']
          associated_dataset.dataset.schema.name.should == legacy_associated_dataset['schema_name']
          associated_dataset.dataset.schema.database.name.should == legacy_associated_dataset['database_name']
          associated_dataset.dataset.schema.database.instance_id.should == legacy_associated_dataset['chorus_rails_instance_id'].to_i
        end
      end
    end
  end
end

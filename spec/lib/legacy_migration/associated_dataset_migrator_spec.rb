require 'spec_helper'

describe AssociatedDatasetMigrator, :legacy_migration => true, :type => :legacy_migration do

  def migrate_others
    UserMigrator.new.migrate
    InstanceMigrator.new.migrate
    InstanceAccountMigrator.new.migrate
    WorkspaceMigrator.new.migrate
  end

  describe ".migrate" do
    LEGACY_ASSOCIATED_DATASETS_SQL = <<-SQL
      SELECT
        edc_dataset.*,
        edc_workspace.chorus_rails_workspace_id,
        edc_instance.chorus_rails_instance_id
      FROM edc_dataset
      LEFT JOIN edc_workspace
        ON edc_dataset.workspace_id = edc_workspace.id
      LEFT JOIN edc_instance
        ON edc_dataset.instance_id = edc_instance.id
    SQL

    describe "the new foreign key column" do
      before(:each) do
        Legacy.connection.column_exists?(:edc_dataset, :chorus_rails_associated_dataset_id).should be_false
      end

      it "adds the new foreign key column" do
        migrate_others
        AssociatedDatasetMigrator.new.migrate
        Legacy.connection.column_exists?(:edc_dataset, :chorus_rails_associated_dataset_id).should be_true
      end
    end

    describe "copying the data" do
      before do
        migrate_others
      end

      it "creates new associated dataset from legacy associated datasets" do
        expect {
          AssociatedDatasetMigrator.new.migrate
        }.to change(AssociatedDataset, :count).by(14)
      end

      it "copies the correct data fields from the legacy associated dataset" do
        AssociatedDatasetMigrator.new.migrate

        Legacy.connection.select_all(LEGACY_ASSOCIATED_DATASETS_SQL).each do |legacy_associated_dataset|
          next if legacy_associated_dataset['type'] == 'CHORUS_VIEW'
          if(!legacy_associated_dataset["chorus_rails_associated_dataset_id"])
            puts legacy_associated_dataset
          end
          associated_dataset = AssociatedDataset.unscoped.find(legacy_associated_dataset["chorus_rails_associated_dataset_id"])

          associated_dataset.workspace_id.should == legacy_associated_dataset['chorus_rails_workspace_id'].to_i
          associated_dataset.dataset.name.should == legacy_associated_dataset['object_name']
          associated_dataset.dataset.schema.name.should == legacy_associated_dataset['schema_name']
          associated_dataset.dataset.schema.database.name.should == legacy_associated_dataset['database_name']
          associated_dataset.dataset.schema.database.instance_id.should == legacy_associated_dataset['chorus_rails_instance_id'].to_i
        end
      end
    end
  end
end

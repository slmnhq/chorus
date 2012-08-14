class AssociatedDatasetMigrator
  def migrate
    Sunspot.session = Sunspot::Rails::StubSessionProxy.new(Sunspot.session)

    legacy_associated_datasets.each_with_index do |legacy_associated_dataset, i|
      next if legacy_associated_dataset['type'] == 'CHORUS_VIEW'
      instance = Instance.find(legacy_associated_dataset['chorus_rails_instance_id'])
      database = instance.databases.find_or_create_by_name(legacy_associated_dataset['database_name'])
      schema = database.schemas.find_or_create_by_name(legacy_associated_dataset['schema_name'])
      dataset = schema.datasets.find_or_create_by_name(legacy_associated_dataset['object_name'])
      new_associated_dataset = AssociatedDataset.new({
          :dataset_id => dataset.id
      }, {
          :without_protection => true
      }
      )
      new_associated_dataset.workspace = Workspace.unscoped.find_by_legacy_id(legacy_associated_dataset['workspace_id'])
      new_associated_dataset.save!

      Legacy.connection.update("UPDATE edc_dataset SET chorus_rails_associated_dataset_id = #{new_associated_dataset.id} WHERE id = '#{legacy_associated_dataset['id']}'")
    end
  end

  def legacy_associated_datasets
    Legacy.connection.select_all(<<SQL)
      SELECT
        edc_dataset.*,
        edc_instance.chorus_rails_instance_id
      FROM edc_dataset
      LEFT JOIN edc_instance
        ON edc_dataset.instance_id = edc_instance.id
SQL
  end
end
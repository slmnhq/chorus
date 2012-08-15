class DatabaseObjectMigrator
  def prerequisites
    InstanceMigrator.new.migrate
  end

  def migrate
    Sunspot.session = Sunspot::Rails::StubSessionProxy.new(Sunspot.session)

    prerequisites

    # Result should be a all dataset identifiers across the entire Chorus 2.1 app
    # We have to resolve different quoting (inconsistency in chorus 2.1)
    dataset_rows = Legacy.connection.exec_query("
      SELECT DISTINCT dataset_string FROM
        (
          (
            SELECT replace(object_id, '\"', '') AS dataset_string
            FROM legacy_migrate.edc_activity_stream_object
            WHERE entity_type = 'databaseObject'
          )
          UNION
          (
            SELECT replace(composite_id, '\"', '') AS dataset_string
            FROM legacy_migrate.edc_dataset
            WHERE type = 'SOURCE_TABLE'
          )
        ) a
      WHERE dataset_string NOT IN (select legacy_id from datasets);
    ")
    dataset_rows.each do |row_hash|
      dataset_string = row_hash['dataset_string']
      ids = dataset_string.split("|")

      legacy_instance_id = ids[0]
      database_name = ids[1]
      schema_name = ids[2]
      dataset_name = ids[4]

      instance = Instance.find_by_legacy_id!(legacy_instance_id)
      database = instance.databases.find_or_create_by_name(database_name)
      schema = database.schemas.find_or_create_by_name(schema_name)

      dataset = schema.datasets.new
      dataset.name = dataset_name
      dataset.legacy_id = dataset_string
      dataset.save!
    end

    # ensure that all referenced sandboxes have a schema.
    schema_rows = Legacy.connection.exec_query("
      SELECT DISTINCT instance_id,
                      database_name,
                      schema_name
      FROM legacy_migrate.edc_sandbox")

    schema_rows.each do |row|
      instance = Instance.find_by_legacy_id!(row['instance_id'])
      database = instance.databases.find_or_create_by_name(row['database_name'])
      database.schemas.find_or_create_by_name(row['schema_name'])
    end
  end
end

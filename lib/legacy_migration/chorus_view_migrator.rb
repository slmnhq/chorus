class ChorusViewMigrator < AbstractMigrator
  class << self
    def prerequisites
      DatabaseObjectMigrator.migrate
    end

    def classes_to_validate
      [Dataset]
    end

    def migrate
      prerequisites

      silence_activerecord do
        dataset_rows = Legacy.connection.exec_query(%Q(
          SELECT normalize_key(composite_id) AS dataset_string, workspace_id, query, created_tx_stamp, last_updated_tx_stamp
          FROM edc_dataset
          WHERE type = 'CHORUS_VIEW'
          AND normalize_key(composite_id) NOT IN (select legacy_id from datasets);
        ))

        dataset_rows.each do |row_hash|
          dataset_string = row_hash['dataset_string']
          ids = dataset_string.split("|")

          legacy_instance_id = ids[0]
          database_name = ids[1]
          schema_name = ids[2]
          dataset_name = ids[4]

          gpdb_instance = GpdbInstance.find_by_legacy_id!(legacy_instance_id)
          database = gpdb_instance.databases.find_or_create_by_name(database_name)
          schema = database.schemas.find_or_create_by_name(schema_name)

          dataset = schema.datasets.new
          dataset.legacy_id = dataset_string

          dataset.name = dataset_name
          dataset.type = 'ChorusView'
          dataset.query = row_hash['query']
          dataset.created_at = row_hash['created_tx_stamp']
          dataset.updated_at = row_hash['last_updated_tx_stamp']
          dataset.edc_workspace_id = row_hash['workspace_id']

          # check to see if this chorus view's name conflicts with any tables/views or other chorus views.
          unless dataset.valid?
            new_name =  "#{dataset_name}_#{row_hash['workspace_id']}"
            puts "Found a duplicate chorus view: #{dataset_name}. Renaming to #{new_name}"
            dataset.name = new_name
          end

          dataset.save!
        end
      end
    end
  end
end
class HdfsEntryMigrator < AbstractMigrator
  class << self
    def prerequisites
      HadoopInstanceMigrator.migrate
    end

    def classes_to_validate
      [
          [HdfsEntry, {:include => :hadoop_instance}]
      ]
    end

    def migrate
      prerequisites

      Sunspot.session = Sunspot::Rails::StubSessionProxy.new(Sunspot.session)

      Legacy.connection.exec_query(%Q(
      SELECT DISTINCT
        entity_id
      FROM
        edc_comment
      WHERE
        edc_comment.entity_type = 'hdfs'
        AND entity_id NOT IN (SELECT hadoop_instances.legacy_id || '|' || path from hdfs_entries INNER JOIN hadoop_instances ON hadoop_instances.id = hdfs_entries.hadoop_instance_id WHERE is_directory = false)
      )).each do |legacy_row|
        legacy_hadoop_instance_id, path = legacy_row["entity_id"].split("|")
        hadoop_instance = HadoopInstance.find_by_legacy_id!(legacy_hadoop_instance_id)
        entry = HdfsEntry.find_or_initialize_by_hadoop_instance_id_and_path(hadoop_instance.id, path)
        entry.is_directory = false
        entry.save!
      end

      Sunspot.session = Sunspot.session.original_session
    end
  end
end

class HadoopInstanceMigrator < AbstractMigrator
  class << self
    def prerequisites
      UserMigrator.migrate
      ensure_legacy_id :hadoop_instances
    end

    def classes_to_validate
      [HadoopInstance]
    end

    def migrate
      prerequisites

      Legacy.connection.exec_query("
        INSERT INTO public.hadoop_instances(
          legacy_id,
          name,
          description,
          host,
          port,
          owner_id,
          username,
          group_list,
          created_at,
          updated_at
          )
        SELECT
          i.id,
          i.name,
          i.description,
          i.host,
          i.port,
          u.id,
          split_part(map.db_user_name, ',', 1),
          substring(map.db_user_name, position(',' in map.db_user_name) + 1),
          i.created_tx_stamp,
          i.last_updated_tx_stamp
        FROM edc_instance i
          INNER JOIN users u
          ON u.username = i.owner
          INNER JOIN edc_account_map map
          ON map.instance_id = i.id
        WHERE instance_provider = 'Hadoop'
        AND is_deleted = 'f'
        AND i.id NOT IN (SELECT legacy_id FROM hadoop_instances);")
    end
  end
end


class InstanceMigrator < AbstractMigrator
  class << self
    def prerequisites
      UserMigrator.migrate
      ensure_legacy_id :instances
    end

    def classes_to_validate
      [Instance]
    end

    def migrate
      prerequisites
      Legacy.connection.exec_query("INSERT INTO public.instances(
                              legacy_id,
                              name,
                              description,
                              host,
                              port,
                              provision_type,
                              instance_provider,
                              maintenance_db,
                              owner_id,
                              created_at,
                              updated_at
                              )
                            SELECT
                              i.id,
                              i.name,
                              i.description,
                              i.host,
                              i.port,
                              i.provision_type,
                              i.instance_provider,
                              i.maintenance_db,
                              u.id,
                              i.created_tx_stamp,
                              i.last_updated_tx_stamp
                            FROM edc_instance i
                              INNER JOIN users u
                              ON u.username = i.owner
                            WHERE instance_provider = 'Greenplum Database'
                            AND i.id NOT IN (SELECT legacy_id FROM instances);")

    end
  end
end
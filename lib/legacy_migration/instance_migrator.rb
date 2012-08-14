class InstanceMigrator
  def prerequisites
    UserMigrator.new.migrate
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
                          FROM legacy_migrate.edc_instance i
                            INNER JOIN users u
                            ON u.username = i.owner
                          WHERE instance_provider = 'Greenplum Database'
                          AND i.id NOT IN (SELECT legacy_id FROM instances);")

    # populate old table with new primary keys for lookup
    #TODO REMOVE ME
    Legacy.connection.exec_query("UPDATE legacy_migrate.edc_instance
                          SET chorus_rails_instance_id = instances.id
                          FROM public.instances
                          WHERE instances.legacy_id = legacy_migrate.edc_instance.id;")
  end
end
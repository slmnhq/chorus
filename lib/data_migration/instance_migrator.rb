class InstanceMigrator
  def migrate
    unless Legacy.connection.column_exists?(:edc_instance, :chorus_rails_instance_id)
      Legacy.connection.add_column :edc_instance, :chorus_rails_instance_id, :integer
    end

    legacy_instances.each do |instance|
      new_instance = Instance.new

      new_instance.name = instance["name"]
      new_instance.description = instance["description"]
      new_instance.host = instance["host"]
      new_instance.port = instance["port"]
      #new_instance.expire = instance["expire"]
      #new_instance.state = instance["state"]
      new_instance.provision_type = instance["provision_type"]
      #new_instance.provision_id = instance["provision_id"]
      #new_instance.size = instance["size"]
      new_instance.instance_provider = instance["instance_provider"]
      #new_instance.last_check = instance["last_check"]
      #new_instance.provision_name = instance["provision_name"]
      #new_instance.is_deleted = instance["is_deleted"]
      #new_instance.instance_version = instance["instance_version"]
      new_instance.maintenance_db = instance["maintenance_db"]
      #new_instance.connection_string = instance["connection_string"]
      new_instance.owner_id = instance["chorus_rails_user_id"]

      new_instance.save!

      id = instance["id"]
      Legacy.connection.update("Update edc_instance SET chorus_rails_instance_id = #{new_instance.id} WHERE id = '#{id}'")
    end
  end

  def legacy_instances
    Legacy.connection.select_all(<<SQL)
      SELECT edc_instance.*, edc_user.chorus_rails_user_id
      FROM edc_instance
      INNER JOIN edc_user ON edc_instance.owner = edc_user.user_name
      WHERE instance_provider = 'Greenplum Database'
SQL
  end
end
class InstanceMigrator
  def self.migrate
    unless Legacy.connection.column_exists?(:edc_instance, :chorus_rails_instance_id)
      Legacy.connection.add_column :edc_instance, :chorus_rails_instance_id, :integer
    end

    instances = Legacy.connection.select_all("SELECT * from edc_instance")
    instances.each do |instance|
      new_instance = Instance.new

      new_instance.name = instance["name"]
      new_instance.description = instance["description"]
      new_instance.owner = instance["owner"]
      new_instance.host = instance["host"]
      new_instance.port = instance["port"]
      new_instance.expire = instance["expire"]
      new_instance.state = instance["state"]
      new_instance.provision_type = instance["provision_type"]
      new_instance.provision_id = instance["provision_id"]
      new_instance.size = instance["size"]
      new_instance.instance_provider = instance["instance_provider"]
      new_instance.last_check = instance["last_check"]
      new_instance.provision_name = instance["provision_name"]
      new_instance.is_deleted = instance["is_deleted"]
      new_instance.instance_version = instance["instance_version"]
      new_instance.maintenance_db = instance["maintenance_db"]
      new_instance.connection_string = instance["connection_string"]
      new_instance.save!

      id = instance["id"]
      Legacy.connection.update("Update edc_instance SET chorus_rails_instance_id = #{new_instance.id} WHERE id = '#{id}'")
    end
  end
end
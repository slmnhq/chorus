class HadoopInstanceMigrator
  def migrate
    legacy_instances.each do |instance|
      new_instance = HadoopInstance.new

      new_instance.name = instance["name"]
      new_instance.description = instance["description"]
      new_instance.host = instance["host"]
      new_instance.port = instance["port"].to_i
      new_instance.owner_id = instance["chorus_rails_user_id"]

      credentials = instance['db_user_name'].split(',')
      new_instance.username = credentials[0]
      new_instance.group_list = credentials[1..-1].join(",")


      new_instance.save!

      id = instance["id"]
      Legacy.connection.update("Update edc_instance SET chorus_rails_instance_id = #{new_instance.id} WHERE id = '#{id}'")
    end
  end

  def legacy_instances
    Legacy.connection.select_all(<<SQL)
      SELECT edc_instance.*, edc_user.chorus_rails_user_id, am.db_user_name
      FROM edc_instance
      INNER JOIN edc_user ON edc_instance.owner = edc_user.user_name
      INNER JOIN edc_account_map am ON am.instance_id = edc_instance.id
      WHERE instance_provider = 'Hadoop' AND edc_instance.is_deleted = 'f'
SQL
  end
end


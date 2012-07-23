class DatabaseMigrator
  def migrate
    Instance.find_each do |instance|
      account = InstanceAccount.find_by_instance_id_and_owner_id(instance.id, instance.owner)
      GpdbDatabase.refresh(account)

      instance.databases.find_each do |database|
        GpdbSchema.refresh(account, database)
      end
    end
  end
end
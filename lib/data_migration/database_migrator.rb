class DatabaseMigrator
  def migrate
    Instance.all.each do |instance|
      account = InstanceAccount.find_by_instance_id_and_owner_id(instance.id, instance.owner)
      GpdbDatabase.refresh(account)

      instance.databases.each do |database|
        GpdbSchema.refresh(account, database)
      end
    end
  end
end
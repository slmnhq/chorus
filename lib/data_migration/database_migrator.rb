class DatabaseMigrator
  def migrate
    Instance.all.each do |instance|
      account = InstanceAccount.find_by_owner_id(instance.owner)
      GpdbDatabase.refresh(account)

      instance.databases.each do |database|
        GpdbSchema.refresh(account, database)
      end
    end
  end
end
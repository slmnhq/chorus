class GpdbSchemaAccess < DefaultAccess
  def index?(anything, database, account)
    current_user.admin? || account != nil || database.instance.shared? || database.instance.owner == current_user
  end

  def show?(schema)
    database = schema.database
    account = database.instance.account_for_user current_user
    index?(GpdbSchema, database, account)
  end
end

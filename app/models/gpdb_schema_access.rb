class GpdbSchemaAccess < DefaultAccess
  def index?(anything, database, account)
    database.instance.shared? || database.instance.owner == current_user || current_user.admin? || account != nil
  end

  def show?(schema)
    database = schema.database
    account = database.instance.account_for_user current_user
    index?(GpdbSchema, database, account)
  end
end

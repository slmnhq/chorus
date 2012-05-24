class SchemaAccess < DefaultAccess
  def index?(database, account)
    database.instance.shared? || database.instance.owner == current_user || current_user.admin? || account != nil
  end

  def show?(schema)
    database = schema.database
    account = database.instance.account_for_user current_user
    index?(database, account)
  end
end

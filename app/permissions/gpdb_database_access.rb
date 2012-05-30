class GpdbDatabaseAccess < DefaultAccess
  def show?(database)
    database.instance.account_for_user(current_user).present?
  end
end

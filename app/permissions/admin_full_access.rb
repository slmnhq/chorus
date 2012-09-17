class AdminFullAccess < DefaultAccess
  def can?(*args)
    current_user.admin? || super(*args)
  end
end

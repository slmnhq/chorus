class InstanceAccess < DefaultAccess
  def edit?(instance)
    current_user.admin? || instance.owner == current_user
  end
end


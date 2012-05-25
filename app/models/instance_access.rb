class InstanceAccess < DefaultAccess
  def edit?(instance)
    current_user.admin? || instance.owner == current_user
  end

  def show?(instance)
    instance.shared? || current_user.admin? || current_user.instance_accounts.pluck(:instance_id).include?(instance.id)
  end
end


class InstanceAccess < DefaultAccess
  def edit?(instance)
    instance.owner == current_user
  end

  def show?(instance)
    instance.shared? || current_user.instance_accounts.exists?(:instance_id => instance.id)
  end
end


class InstanceAccess < DefaultAccess
  def self.instances_for(current_user)
    Instance.accessible_to(current_user)
  end

  def edit?(instance)
    instance.owner == current_user || current_user.admin?
  end

  def show_contents?(instance)
    instance.shared? || current_user.instance_accounts.exists?(:instance_id => instance.id)
  end
end
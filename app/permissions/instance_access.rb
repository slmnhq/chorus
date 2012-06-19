class InstanceAccess < DefaultAccess
  def self.instances_for(current_user)
    if current_user.admin?
      Instance.scoped
    else
      Instance.accessible_to(current_user)
    end
  end

  def edit?(instance)
    instance.owner == current_user
  end

  def show_contents?(instance)
    instance.shared? || current_user.instance_accounts.exists?(:instance_id => instance.id)
  end
end


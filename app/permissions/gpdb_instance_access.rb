class GpdbInstanceAccess < DefaultAccess
  def self.gpdb_instances_for(current_user)
    GpdbInstance.accessible_to(current_user)
  end

  def edit?(gpdb_instance)
    gpdb_instance.owner == current_user || current_user.admin?
  end

  def show_contents?(gpdb_instance)
    gpdb_instance.shared? || current_user.instance_accounts.exists?(:gpdb_instance_id => gpdb_instance.id)
  end
end
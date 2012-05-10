class MembershipMigrator
  def migrate
    unless Legacy.connection.column_exists?(:edc_member, :chorus_rails_membership_id)
      Legacy.connection.add_column :edc_member, :chorus_rails_membership_id, :integer
    end

    legacy_members.each do |member|
      new_membership = Membership.new
      new_membership.user = User.unscoped.find_by_username(member["member_name"])
      legacy_workspace_row = Legacy.connection.select_one("select * from edc_workspace where id = '#{member["workspace_id"]}'")
      new_membership.workspace = Workspace.find(legacy_workspace_row["chorus_rails_workspace_id"])
      new_membership.save!

      id = member["id"]
      Legacy.connection.update("Update edc_member SET chorus_rails_membership_id = #{new_membership.id} WHERE id = '#{id}'")
    end
  end

  def legacy_members
    Legacy.connection.select_all(<<SQL)
      SELECT edc_member.*
      FROM edc_member
SQL
  end
end
class MembershipMigrator
  def migrate
    Legacy.connection.exec_query("INSERT INTO public.memberships(
                              legacy_id,
                              user_id,
                              workspace_id)
                            SELECT
                              edc_member.id::integer,
                              users.id,
                              workspaces.id
                              FROM legacy_migrate.edc_member
                              JOIN users
                              ON users.username = edc_member.member_name
                              JOIN workspaces
                              ON workspaces.legacy_id = edc_member.workspace_id::integer;")

    Legacy.connection.exec_query("UPDATE edc_member SET chorus_rails_membership_id = memberships.id FROM memberships WHERE edc_member.id::integer = memberships.legacy_id;")

    Legacy.connection.exec_query("INSERT INTO memberships(workspace_id, user_id)
                                    SELECT workspaces.id, workspaces.owner_id
                                    FROM workspaces
                                    LEFT OUTER JOIN memberships
                                      ON workspaces.owner_id = memberships.user_id
                                      AND workspaces.id = memberships.workspace_id
                                    WHERE memberships.id IS NULL;")
  end
end
require_relative 'legacy'

class UserMigrator
  def migrate
    Sunspot.session = Sunspot::Rails::StubSessionProxy.new(Sunspot.session)
    Legacy.connection.exec_query("INSERT INTO public.users(
                              legacy_id,
                              username,
                              first_name,
                              last_name,
                              email,
                              title,
                              dept,
                              notes,
                              created_at,
                              updated_at,
                              deleted_at,
                              password_digest)
                            SELECT
                              edc_user.id,
                              user_name,
                              first_name,
                              last_name,
                              email_address,
                              title,
                              ou,
                              notes,
                              created_tx_stamp,
                              last_updated_tx_stamp,
                              CASE is_deleted
                                  WHEN 't' THEN last_updated_tx_stamp
                                  ELSE null
                                END,
                              substring(password, 6)
                            FROM legacy_migrate.edc_user;")

    # populate old table with new primary keys for lookup
    Legacy.connection.exec_query("UPDATE legacy_migrate.edc_user
                            SET chorus_rails_user_id = users.id
                            FROM public.users
                            WHERE users.username = legacy_migrate.edc_user.user_name;")
  end
end
class InstanceAccountMigrator < AbstractMigrator
  class << self
    def prerequisites
      GpdbInstanceMigrator.migrate
      HadoopInstanceMigrator.migrate
    end

    def classes_to_validate
      [InstanceAccount]
    end

    def migrate
      prerequisites

      # Make sure gpdb_instances are flagged as shared if any legacy account maps are shared
      Legacy.connection.exec_query("UPDATE gpdb_instances SET shared = true WHERE legacy_id IN (SELECT instance_id FROM edc_account_map WHERE shared = 'yes');")

      inserted = Legacy.connection.exec_query("INSERT INTO public.instance_accounts(
                                legacy_id,
                                db_username,
                                owner_id,
                                gpdb_instance_id
                              )
                              SELECT
                                map.id,
                                db_user_name,
                                u.id,
                                i.id
                              FROM edc_account_map map
                              INNER JOIN users u
                                ON u.username = map.user_name
                              INNER JOIN gpdb_instances i
                                ON map.instance_id = i.legacy_id
                              WHERE map.id NOT IN (SELECT legacy_id FROM instance_accounts)
                              AND i.instance_provider = 'Greenplum Database'
                              AND NOT (map.shared = 'no' AND i.shared = true);")

      unless inserted == 0
        InstanceAccount.where("legacy_id is not null").each do |instance_account|
          result = Legacy.connection.exec_query("SELECT db_password, secret_key
                                                 FROM edc_account_map
                                                 WHERE id = '#{instance_account.legacy_id}'").first
          instance_account.update_attribute(:db_password, decrypt_password(result['db_password'], result['secret_key']))
        end
      end
    end

    def decrypt_password(password, key)
      cipher = OpenSSL::Cipher::AES.new("128-CBC")

      cipher.decrypt
      cipher.iv = "\0" * 16
      cipher.key = key
      d = cipher.update password
      return d + cipher.final
    end
  end
end
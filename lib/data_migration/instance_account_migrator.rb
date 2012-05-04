class InstanceAccountMigrator
  def migrate
    unless Legacy.connection.column_exists?(:edc_account_map, :chorus_rails_instance_account_id)
      Legacy.connection.add_column :edc_account_map, :chorus_rails_instance_account_id, :integer
    end

    legacy_instance_ids = Legacy.connection.select_values("SELECT DISTINCT(instance_id) from edc_account_map")

    legacy_instance_ids.each do |legacy_instance_id|
      legacy_accounts = legacy_instance_accounts legacy_instance_id

      shared_legacy_accounts = legacy_accounts.reject do |legacy_account|
        legacy_account["shared"] != "yes"
      end.compact

      if shared_legacy_accounts.present?
        instance = Instance.find(shared_legacy_accounts.first["chorus_rails_instance_id"])
        instance.update_attribute(:shared, true)
        legacy_accounts = shared_legacy_accounts
      end

      legacy_accounts.each do |legacy_account|
        new_account = InstanceAccount.new
        new_account.db_username = legacy_account["db_user_name"]
        new_account.db_password = decrypt_password(legacy_account["db_password"], legacy_account["secret_key"])
        new_account.owner_id = legacy_account["chorus_rails_user_id"]
        new_account.instance_id = legacy_account["chorus_rails_instance_id"]
        new_account.save!

        sql = "Update edc_account_map SET chorus_rails_instance_account_id = #{new_account.id} WHERE id = '#{legacy_account["id"]}'"
        Legacy.connection.update(sql)
      end
    end
  end

  def legacy_instance_accounts(instance_id)
    Legacy.connection.select_all <<-EOSQL
      SELECT edc_account_map.*, edc_instance.chorus_rails_instance_id, edc_user.chorus_rails_user_id
      FROM edc_account_map
      JOIN edc_instance ON edc_account_map.instance_id = edc_instance.id
      JOIN edc_user ON edc_user.user_name = edc_account_map.user_name
      WHERE instance_provider = 'Greenplum Database'
      AND instance_id = '#{instance_id}'
    EOSQL
  end

  def decrypt_password(password, key)
    cipher = OpenSSL::Cipher::Cipher.new("AES-128-CBC")
    cipher.decrypt
    cipher.key = key
    d = cipher.update password
    d << cipher.final
  end
end
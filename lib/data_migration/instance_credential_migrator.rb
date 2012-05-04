class InstanceCredentialMigrator
  def migrate
    unless Legacy.connection.column_exists?(:edc_account_map, :chorus_rails_instance_credentials_id)
      Legacy.connection.add_column :edc_account_map, :chorus_rails_instance_credentials_id, :integer
    end

    legacy_instance_ids = Legacy.connection.select_values("SELECT DISTINCT(instance_id) from edc_account_map")

    legacy_instance_ids.each do |legacy_instance_id|
      legacy_credentials = legacy_instance_credentials legacy_instance_id

      shared_legacy_credentials = legacy_credentials.reject do |legacy_credential|
        legacy_credential["shared"] != "yes"
      end.compact

      if shared_legacy_credentials.present?
        instance = Instance.find(shared_legacy_credentials.first["chorus_rails_instance_id"])
        instance.update_attribute(:shared, true)
        legacy_credentials = shared_legacy_credentials
      end

      legacy_credentials.each do |legacy_credential|
        new_credential = InstanceAccount.new
        new_credential.db_username = legacy_credential["db_user_name"]
        new_credential.db_password = decrypt_password(legacy_credential["db_password"], legacy_credential["secret_key"])
        new_credential.owner_id = legacy_credential["chorus_rails_user_id"]
        new_credential.instance_id = legacy_credential["chorus_rails_instance_id"]
        new_credential.save!

        sql = "Update edc_account_map SET chorus_rails_instance_credentials_id = #{new_credential.id} WHERE id = '#{legacy_credential["id"]}'"
        Legacy.connection.update(sql)
      end
    end
  end

  def legacy_instance_credentials(instance_id)
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
class InstanceCredentialMigrator
  def self.migrate
    unless Legacy.connection.column_exists?(:edc_account_map, :chorus_rails_instance_credentials_id)
      Legacy.connection.add_column :edc_account_map, :chorus_rails_instance_credentials_id, :integer
    end

    legacy_instance_credentials.each do |credential|
      new_credential = InstanceCredential.new
      new_credential.username = credential["db_user_name"]
      new_credential.password = decrypt_password(credential["db_password"], credential["secret_key"])
      new_credential.shared = (credential["shared"] == "yes")
      new_credential.owner_id = credential["chorus_rails_user_id"]
      new_credential.instance_id = credential["chorus_rails_instance_id"]
      new_credential.save!

      sql = "Update edc_account_map SET chorus_rails_instance_credentials_id = #{new_credential.id} WHERE id = '#{credential["id"]}'"
      Legacy.connection.update(sql)
    end
  end

  def self.legacy_instance_credentials
    Legacy.connection.select_all <<-EOSQL
      SELECT edc_account_map.*, edc_instance.chorus_rails_instance_id, edc_user.chorus_rails_user_id
      FROM edc_account_map
      JOIN edc_instance ON edc_account_map.instance_id = edc_instance.id
      JOIN edc_user ON edc_user.user_name = edc_account_map.user_name
      WHERE instance_provider = 'Greenplum Database'
    EOSQL
  end

  def self.decrypt_password(password, key)
    cipher = OpenSSL::Cipher::Cipher.new("AES-128-CBC")
    cipher.decrypt
    cipher.key = key
    d = cipher.update password
    d << cipher.final
  end
end
class EncryptInstanceAccountPasswords < ActiveRecord::Migration
  def up
    add_column :instance_accounts, :encrypted_db_password, :string
    InstanceAccount.find_each do |account|
      account.db_password = ActiveRecord::Base.connection.select_values("select db_password from instance_accounts where id = #{account.id}").first
      account.save(:validate => false)
    end
    remove_column :instance_accounts, :db_password
  end

  def down
    add_column :instance_accounts, :db_password, :string

    ActiveRecord::Base.connection.select_all("select id, encrypted_db_password from instance_accounts").each do |row|
      decrypted_password = decrypt_password(row['encrypted_db_password'])
      ActiveRecord::Base.connection.execute <<-EOQ
        update instance_accounts
        set db_password = '#{decrypted_password}'
        where id = #{row['id']}
      EOQ
    end

    remove_column :instance_accounts, :encrypted_db_password
  end

  def decrypt_password(password)
    do_cipher(:decrypt, [password].pack("H*"))
  end

  def do_cipher(method, password)
    cipher = OpenSSL::Cipher::AES.new("128-CBC").send(method)
    cipher.key = Chorus::Application.config.chorus['passphrase'] || 'secret0123456789'
    cipher.update(password) + cipher.final
  end
end

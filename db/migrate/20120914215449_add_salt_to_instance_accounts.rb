class AddSaltToInstanceAccounts < ActiveRecord::Migration
  def up
    add_column :instance_accounts, :salt, :string

    # set all passwords to "secret" assuming passphrase "secret0123456789"
    ActiveRecord::Base.connection.select_all("select id from instance_accounts").each do |row|
      ActiveRecord::Base.connection.execute <<-EOQ
        update instance_accounts
        set encrypted_db_password = '2a595a66178a7801421c92f57a93759d',
        salt = 'SYQ+zXyv'
        where id = #{row['id']}
      EOQ
    end

    # reset the salt
    InstanceAccount.find_each do |account|
      account.db_password = "secret"
      account.save!
    end
  end

  def down
    # Just set all passwords to "secret" assuming passphrase "secret0123456789"
    ActiveRecord::Base.connection.select_all("select id from instance_accounts").each do |row|
      ActiveRecord::Base.connection.execute <<-EOQ
        update instance_accounts
        set encrypted_db_password = '966a873822154784d456cb70dea53375'
        where id = #{row['id']}
      EOQ
    end

    remove_column :instance_accounts, :salt
  end

end

class RemoveSaltFromInstanceAccount < ActiveRecord::Migration
  def up
    remove_column :instance_accounts, :salt

    # set all passwords to 'secret'
    InstanceAccount.find_each do |account|
      account.db_password = "secret"
      account.save!
    end
  end

  def down
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
  end
end

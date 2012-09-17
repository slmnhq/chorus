class UpdateInstanceAccountPasswords < ActiveRecord::Migration
  def change
    # set all passwords to 'secret'
    InstanceAccount.find_each do |account|
      account.db_password = "secret"
      account.save!
    end
  end
end

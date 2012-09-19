class UpdatePasswordEncryptionFrom256to128 < ActiveRecord::Migration
  def change
    # set all passwords to 'secret'
    InstanceAccount.find_each do |account|
      account.update_attributes(:db_password => "secret")
    end
  end
end

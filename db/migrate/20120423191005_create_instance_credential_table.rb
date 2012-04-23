class CreateInstanceCredentialTable < ActiveRecord::Migration
  def change
    create_table :instance_credentials do |t|
      t.string :username
      t.binary :password
      t.integer :instance_id
      t.integer :owner_id
      t.boolean :shared
    end
  end
end

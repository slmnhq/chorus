class InstanceAccountPasswordIsString < ActiveRecord::Migration
  def up
    change_table :instance_accounts do |t|
      t.change :db_password, :string
    end
  end

  def down
    change_table :instance_accounts do |t|
      t.change :db_password, :binary
    end
  end
end

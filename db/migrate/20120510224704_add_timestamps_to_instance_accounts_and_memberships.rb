class AddTimestampsToInstanceAccountsAndMemberships < ActiveRecord::Migration
  def change
    add_column(:instance_accounts, :created_at, :datetime)
    add_column(:instance_accounts, :updated_at, :datetime)
    add_column(:memberships, :created_at, :datetime)
    add_column(:memberships, :updated_at, :datetime)
  end
end

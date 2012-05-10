class CreateMembershipsTable < ActiveRecord::Migration
  def change
    create_table :memberships do |t|
      t.integer :user_id
      t.integer :workspace_id
    end

    add_index :memberships, :user_id
    add_index :memberships, :workspace_id
  end
end

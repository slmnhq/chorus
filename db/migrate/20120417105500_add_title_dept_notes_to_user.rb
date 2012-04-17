class AddTitleDeptNotesToUser < ActiveRecord::Migration
  def change
    add_column :users, :title, :string
    add_column :users, :dept, :string
    add_column :users, :notes, :text
  end
end

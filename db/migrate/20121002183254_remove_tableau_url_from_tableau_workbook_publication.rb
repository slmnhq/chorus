class RemoveTableauUrlFromTableauWorkbookPublication < ActiveRecord::Migration
  def up
    remove_column :tableau_workbook_publications, :tableau_url
  end

  def down
    add_column :tableau_workbook_publications, :tableau_url, :string
  end
end

class AddLinkedTableauWorkfileIdToTableauWorkbookPublications < ActiveRecord::Migration
  def change
    add_column :tableau_workbook_publications, :linked_tableau_workfile_id, :integer
  end
end

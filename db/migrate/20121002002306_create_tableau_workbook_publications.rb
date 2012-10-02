class CreateTableauWorkbookPublications < ActiveRecord::Migration
  def change
    create_table :tableau_workbook_publications do |t|
      t.string :name
      t.integer :dataset_id
      t.integer :workspace_id
      t.string :tableau_url

      t.timestamps
    end
  end
end

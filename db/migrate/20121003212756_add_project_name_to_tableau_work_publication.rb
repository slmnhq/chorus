class AddProjectNameToTableauWorkPublication < ActiveRecord::Migration
  def up
    add_column :tableau_workbook_publications, :project_name, :string
  end

  def down
    remove_column :tableau_workbook_publications, :project_name
  end
end

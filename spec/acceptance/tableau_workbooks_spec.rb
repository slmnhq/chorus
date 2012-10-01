require 'spec_helper'

resource "Tableau Workbooks" do
  let(:dataset) { datasets(:executable_chorus_view) }
  let(:user) { dataset.gpdb_instance.owner }

  before do
    log_in user
    any_instance_of(TableauWorkbook) do |wb|
      stub(wb).save { true }
    end
  end

  post "/datasets/:dataset_id/tableau_workbooks" do
    parameter :name, "Name of the workbook to be created"
    parameter :dataset_id, "id of the dataset to link to the workbook"

    required_parameters :name
    required_parameters :dataset_id

    scope_parameters :tableau_workbook, :all

    let(:dataset_id) { dataset.id }
    let(:name) { 'MyTableauWorkbook'}

    example_request "Create a tableau workbook" do
      status.should == 201
    end
  end
end
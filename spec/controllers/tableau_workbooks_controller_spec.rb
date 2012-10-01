require "spec_helper"

describe TableauWorkbooksController do
  let(:user) { users(:owner) }
  before do
    log_in user
  end

  describe "#create" do
    let(:dataset) { datasets(:table) }

    context 'when the dataset is a table' do
      let(:dataset) { datasets(:table) }

      it 'instantiates the workbook with the table name' do
        mock.proxy(TableauWorkbook).new(hash_including(:db_relname => dataset.name))
        post :create, :dataset_id => dataset.id, :tableau_workbook => {:name => "myTableauWorkbook"}
      end
    end

    context 'when the dataset is a chorus view' do
      let(:dataset) { datasets(:chorus_view) }

      it 'instantiates the workbook with the sql query' do
        mock.proxy(TableauWorkbook).new(hash_including(:query => dataset.query))
        post :create, :dataset_id => dataset.id, :tableau_workbook => {:name => "myTableauWorkbook"}
      end
    end

    it "returns 201 created when the save succeeds" do
      any_instance_of(TableauWorkbook) do |wb|
        mock(wb).save { true }
      end
      post :create, :dataset_id => dataset.id, :tableau_workbook => {:name => "myTableauWorkbook"}
      response.code.should == '201'
    end

    it "responds with error if the save fails" do
      any_instance_of(TableauWorkbook) do |wb|
        mock(wb).save { false }
      end
      post :create, :dataset_id => dataset.id, :tableau_workbook => {:name => "myTableauWorkbook"}
      response.code.should == '422'
    end
  end
end

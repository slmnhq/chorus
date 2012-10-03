require "spec_helper"

describe TableauWorkbooksController do
  let(:user) { users(:owner) }
  let(:save_status) { true }

  before do
    log_in user
    any_instance_of(TableauWorkbook) do |wb|
      mock(wb).save { save_status }
    end
  end

  describe "#create" do
    let(:dataset) { datasets(:table) }
    let(:workspace) { workspaces(:public)}

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

    it "returns 201 created with data when the save succeeds" do
      any_instance_of(TableauWorkbookPublication) do |workbook|
        stub(workbook).workbook_url { "foo.com"}
        stub(workbook).project_url { "foo.com/projects"}
      end
      post :create, :dataset_id => dataset.id, :tableau_workbook => {:name => "myTableauWorkbook"}
      response.code.should == '201'
      decoded_response.name.should == 'myTableauWorkbook'
      decoded_response.url.should == 'foo.com'
      decoded_response.project_url.should == "foo.com/projects"
    end

    it "should create a TableauWorkbookPublished event" do
      post :create, :workspace_id => workspace.to_param, :dataset_id => dataset.id, :tableau_workbook => {:name => "myTableauWorkbook"}
      the_event = Events::Base.first
      the_event.action.should == "TableauWorkbookPublished"
      the_event.dataset.should == dataset
      the_event.workspace.should == workspace
      the_event.workbook_name.should == "myTableauWorkbook"
    end

    it "creates a tableau publication when the save succeeds" do
      post :create, :workspace_id => workspace.to_param, :dataset_id => dataset.id, :tableau_workbook => {:name => "myTableauWorkbook"}
      twp = dataset.tableau_workbook_publications.find_by_name("myTableauWorkbook")
      twp.dataset_id.should == dataset.id
      twp.workspace_id.should == workspace.id
    end

    context "when the save fails" do
      let(:save_status) { false }

      it "responds with error" do
        post :create, :dataset_id => dataset.id, :tableau_workbook => {:name => "myTableauWorkbook"}
        response.code.should == '422'
      end
    end
  end
end

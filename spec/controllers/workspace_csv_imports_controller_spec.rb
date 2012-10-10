require 'spec_helper'

describe WorkspaceCsvImportsController do
  ignore_authorization!

  let(:user) { users(:owner) }
  let(:non_auth_user) { users(:no_collaborators) }
  let(:file) { test_file("test.csv", "text/csv") }
  let(:workspace) { workspaces(:public) }
  let(:truncate) { false }

  before do
    log_in user
    any_instance_of(CsvFile) { |csv| stub(csv).table_already_exists.with_any_args { false } }
  end

  describe "#create" do
    let(:csv_file) { csv_files(:default) }

    let(:csv_import_params) do
      {
          :workspace_id => workspace.id,
          :csv_id => csv_file.id,
          :delimiter => ',',
          :column_names => ['id', 'name'],
          :types => ['integer', 'varchar'],
          :to_table => "table_importing_into",
          :has_header => has_header,
          :type => csv_import_type,
          :columns_map => columns_map
      }
    end

    let(:csv_import_type) { "newTable" }
    let(:has_header) { false }
    let(:columns_map) { nil }

    context "when there's no table conflict" do
      before do
        mock(QC.default_queue).enqueue.with("CsvImporter.import_file", csv_file.id, anything) do | method, file_id, event_id |
          Events::FileImportCreated.by(user).first.id.should == event_id
        end
      end

      it "updates the necessary import fields on the csv file model" do
        post :create, csv_import_params
        csv_file.reload
        csv_file.delimiter.should == ','
        csv_file.column_names.should == ['id', 'name']
        csv_file.types.should == ['integer', 'varchar']
        csv_file.to_table.should == "table_importing_into"
        csv_file.file_contains_header.should == false
        csv_file.workspace.should == workspace
      end

      it "uses authentication" do
        mock(subject).authorize! :create, csv_file
        post :create, csv_import_params
      end

      context "when has_header is true" do
        let(:has_header) { true }
        it "changes the has_header field to file_contains_header FIXME" do
          post :create, csv_import_params
          csv_file.reload
          csv_file.file_contains_header.should be_true
        end
      end

      context "new or existing table" do
        context "new table" do
          it "sets the new_table field to true" do
            any_instance_of(CsvFile) { |csv| stub(csv).table_already_exists.with_any_args { false } }
            post :create, csv_import_params
            csv_file.reload.new_table.should be_true
          end

          it "makes a FILE_IMPORT_CREATED event with no associated dataset" do
            expect {
              post :create, csv_import_params
            }.to change(Events::FileImportCreated, :count).by(1)

            event = Events::FileImportCreated.first
            event.actor.should == user
            event.dataset.should be_nil
            event.workspace.should == workspace
            event.file_name.should == csv_file.contents_file_name
            event.import_type.should == 'file'
            event.destination_table.should == 'table_importing_into'
          end
        end

        context "existing table" do
          let(:csv_import_type) { "existingTable" }
          let(:columns_map) { [{:targetOrder => 'name'}, {:targetOrder => 'id'}].to_json }

          it "sets the new_table field to false" do
            post :create, csv_import_params.merge(:new_table => 'false')
            csv_file.reload.new_table.should be_false
          end

          it "sets the column names based on the columns_map" do
            post :create, csv_import_params
            csv_file.reload.column_names.should == ['name', 'id']
          end

          it "makes a FILE_IMPORT_CREATED event with associated dataset" do
            dataset = datasets(:table)

            post :create, csv_import_params.merge(:to_table => dataset.name)

            event = Events::FileImportCreated.first
            event.actor.should == user
            event.dataset.should == dataset
            event.workspace.should == workspace
            event.file_name.should == csv_file.contents_file_name
            event.import_type.should == 'file'
            event.destination_table.should == 'table'
          end
        end
      end
    end

    context "new table, but a table with that name already exists" do
      before do
        any_instance_of(CsvFile) { |csv|
          stub(csv).table_already_exists("table_importing_into") { true }
          stub(csv).table_already_exists("table_importing_into_1") { false }
        }
      end

      it "returns an error" do
        post :create, csv_import_params

        response.body.should include "TABLE_EXISTS"
      end

      it "does not create an FILE_IMPORT_CREATED event" do
        expect do
          post :create, csv_import_params
        end.to_not change(Events::FileImportCreated, :count)
      end
    end
  end
end
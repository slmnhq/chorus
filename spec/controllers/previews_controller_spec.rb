require 'spec_helper'

describe PreviewsController do
  ignore_authorization!

  let(:gpdb_table) { datasets(:bobs_table) }
  let(:gpdb_instance) { gpdb_table.gpdb_instance }
  let(:user) { users(:carly) }
  let(:account) { gpdb_instance.account_for_user!(user) }

  before do
    log_in user
  end

  describe "#create" do
    context "when create is successful" do
      before do
        fake_result = SqlResult.new
        mock(SqlExecutor).preview_dataset(gpdb_table, account, '0.43214321') { fake_result }
      end

      it "uses authentication" do
        mock(subject).authorize! :show_contents, gpdb_instance
        post :create, :dataset_id => gpdb_table.to_param, :task => {:check_id => '0.43214321'}
      end

      it "reports that the preview was created" do
        post :create, :dataset_id => gpdb_table.to_param, :task => {:check_id => '0.43214321'}
        response.code.should == "201"
      end

      it "renders the preview" do
        post :create, :dataset_id => gpdb_table.to_param, :task => {:check_id => '0.43214321'}
        decoded_response.columns.should_not be_nil
        decoded_response.rows.should_not be_nil
      end

      generate_fixture "dataPreviewTaskResults.json" do
        post :create, :dataset_id => gpdb_table.to_param, :task => {:check_id => "0.43214321"}
        response.should be_success
      end
    end

    context "when there's an error'" do
      before do
        mock(SqlExecutor).preview_dataset(gpdb_table, account, '0.43214321') { raise CancelableQuery::QueryError }
      end
      it "returns an error if the query fails" do
        post :create, :dataset_id => gpdb_table.to_param, :task => {:check_id => '0.43214321'}

        response.code.should == "422"
        decoded_errors.fields.query.INVALID.message.should_not be_nil
      end
    end
  end

  describe "#destroy" do
    it "cancels the data preview command" do
      mock(SqlExecutor).cancel_query(gpdb_table, account, '0.12341234')
      delete :destroy, :dataset_id => gpdb_table.to_param, :id => '0.12341234'

      response.code.should == '200'
    end
  end

  describe "#preview_sql" do
    let(:schema) { gpdb_schemas(:bobs_schema) }
    let(:query) { "SELECT * FROM bobs_table;" }
    let(:user) { users(:bob) }
    let(:check_id) {'0.43214321' }

    it "returns the results of the sql" do
      mock(SqlExecutor).execute_sql(schema, account, check_id, query) { SqlResult.new }

      post :preview_sql, :schema_id => schema.id, :query => query, :check_id => check_id

      response.code.should == '200'
      decoded_response.columns.should_not be_nil
      decoded_response.rows.should_not be_nil
    end
  end
end

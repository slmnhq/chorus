require 'spec_helper'

describe WorkfileExecutionsController do
  let(:workspace_with_sandbox) { workspaces(:bob_public) }
  let(:workspace_member) { users(:carly) }
  let(:workspace_non_member) { users(:alice) }
  let(:workfile) { workfiles(:bob_public) }
  let(:sql) { "Select something from somewhere" }
  let(:check_id) { '12345' }

  describe "#create" do
    it_behaves_like "an action that requires authentication", :post, :create

    context "as a member of the workspace" do
      before do
        log_in workspace_member

        sandbox = workspace_with_sandbox.sandbox
        mock(SqlExecutor).execute_sql(sandbox, sandbox.account_for_user!(workspace_member), check_id, sql, :limit => 500) do
          SqlResult.new
        end
      end

      it "executes the sql, with the check_id, limiting to 500 rows" do
        post :create, :id => workfile.id, :schema_id => workspace_with_sandbox.sandbox.id, :sql => sql, :check_id => check_id
      end

      it "uses the presenter for SqlResult" do
        mock_present { |model| model.should be_a SqlResult }
        post :create, :id => workfile.id, :schema_id => workspace_with_sandbox.sandbox.id, :sql => sql, :check_id => check_id
      end
    end

    describe "rspec fixtures", :database_integration do
      let(:schema) { GpdbSchema.find_by_name!('test_schema') }
      before do
        log_in users(:admin)
        refresh_chorus
      end

      generate_fixture "workfileExecutionResults.json" do
        post :create, :id => workfile.id, :schema_id => schema.id, :sql => 'select * from base_table1', :check_id => check_id
      end

      generate_fixture "workfileExecutionResultsWithWarning.json" do
        post :create, :id => workfile.id, :schema_id => schema.id, :sql => 'create table table_with_warnings (id INT PRIMARY KEY); select * from base_table1', :check_id => check_id
      end

      generate_fixture "workfileExecutionResultsEmpty.json" do
        post :create, :id => workfile.id, :schema_id => schema.id, :sql => '', :check_id => check_id
      end

      generate_fixture "workfileExecutionError.json" do
        post :create, :id => workfile.id, :schema_id => schema.id, :sql => 'select hippopotamus', :check_id => check_id
        response.status.should == 422
      end
    end
  end

  describe "#destroy" do
    it "cancels the query for the given id" do
      log_in workspace_member
      sandbox = workspace_with_sandbox.sandbox
      mock(SqlExecutor).cancel_query(sandbox, sandbox.account_for_user!(workspace_member), check_id)
      delete :destroy, :id => check_id, :schema_id => sandbox.id
      response.should be_success
    end
  end
end

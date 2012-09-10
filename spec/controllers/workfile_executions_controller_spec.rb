require 'spec_helper'

describe WorkfileExecutionsController do
  let(:workspace) { workspaces(:bob_public) }
  let(:workspace_member) { users(:carly) }
  let(:workfile) { workfiles(:bob_public) }
  let(:archived_workspace) { workspaces(:archived) }
  let(:archived_workfile) { workfiles(:archived) }
  let(:sql) { "Select something from somewhere" }
  let(:check_id) { '12345' }

  describe "#create" do
    it_behaves_like "an action that requires authentication", :post, :create

    context "as a member of the workspace" do
      before do
        log_in workspace_member

        sandbox = workspace.sandbox
        mock(SqlExecutor).execute_sql(sandbox, sandbox.account_for_user!(workspace_member), check_id, sql, :limit => 500) do
          SqlResult.new
        end
      end

      it "executes the sql, with the check_id, limiting to 500 rows" do
        post :create, :id => workfile.id, :schema_id => workspace.sandbox.id, :sql => sql, :check_id => check_id
      end

      it "sets the exeuction schema of the workfile" do
        workfile.execution_schema.should_not == workspace.sandbox
        post :create, :id => workfile.id, :schema_id => workspace.sandbox.id, :sql => sql, :check_id => check_id
        workfile.reload.execution_schema.should == workspace.sandbox
      end

      it "uses the presenter for SqlResult" do
        mock_present { |model| model.should be_a SqlResult }
        post :create, :id => workfile.id, :schema_id => workspace.sandbox.id, :sql => sql, :check_id => check_id
      end
    end

    it "uses authorization" do
      log_in workspace_member
      mock(subject).authorize! :can_edit_sub_objects, workspace
      post :create, :id => workfile.id, :schema_id => workspace.sandbox.id, :sql => sql, :check_id => check_id
    end

    it "returns an error if no check_id is given" do
      log_in workspace_member
      post :create, :id => workfile.id, :schema_id => workspace.sandbox.id, :sql => sql
      response.code.should == '422'
      decoded = JSON.parse(response.body)
      decoded['errors']['fields']['check_id'].should have_key('BLANK')
    end

    context "with an archived workspace" do
      it "responds with invalid record response" do
        log_in workspace_member
        post :create, :id => archived_workfile.id, :schema_id => archived_workspace.sandbox.id, :sql => sql, :check_id => check_id
        response.code.should == "422"

        decoded = JSON.parse(response.body)
        decoded['errors']['fields']['workspace'].should have_key('ARCHIVED')
      end
    end

    describe "rspec fixtures", :database_integration do
      let(:schema) { GpdbSchema.find_by_name!('test_schema') }
      before do
        log_in users(:admin)
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
        response.code.should == "422"
      end

      after do
        account = schema.account_for_user!(users(:admin))
        schema.with_gpdb_connection(account) do |connection|
          connection.exec_query("DROP TABLE IF EXISTS table_with_warnings")
        end
      end
    end
  end

  describe "#destroy" do
    before do
      log_in workspace_member
    end

    it "cancels the query for the given id" do
      sandbox = workspace.sandbox
      mock(SqlExecutor).cancel_query(sandbox, sandbox.account_for_user!(workspace_member), check_id)
      delete :destroy, :workfile_id => workfile.id, :id => check_id, :schema_id => sandbox.id
      response.should be_success
    end

    it "returns an error if no check_id is given" do
      delete :destroy, :workfile_id => workfile.id, :schema_id => workspace.sandbox.id
      response.code.should == '422'
      decoded = JSON.parse(response.body)
      decoded['errors']['fields']['check_id'].should have_key('BLANK')
    end

    context "with an archived workspace" do
      it "responds with invalid record response" do
        delete :destroy, :workfile_id => archived_workfile.id, :id => check_id, :schema_id => archived_workspace.sandbox.id
        response.code.should == "422"

        decoded = JSON.parse(response.body)
        decoded['errors']['fields']['workspace'].should have_key('ARCHIVED')
      end
    end
  end
end

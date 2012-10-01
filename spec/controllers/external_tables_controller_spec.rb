require 'spec_helper'

describe ExternalTablesController do
  let(:user) { users(:the_collaborator) }
  let(:sandbox) { gpdb_schemas(:default) }
  let(:workspace) { workspaces(:public) }
  let(:workspace_without_sandbox) { workspaces(:private) }

  let!(:instance_account) { sandbox.gpdb_instance.account_for_user!(user) }
  let(:hadoop_instance) { hadoop_instances(:hadoop) }

  describe "#create" do
    before do
      log_in user
    end

    it_behaves_like "an action that requires authentication", :post, :create

    context "without sandbox" do
      let(:parameters) do
        {
            :hdfs_external_table => {},
            :workspace_id => workspace_without_sandbox.id
        }
      end

      it "fails and responds unprocessable entity" do
        post :create, parameters
        response.code.should == "422"

        decoded = JSON.parse(response.body)
        decoded['errors']['fields']['external_table'].should have_key('EMPTY_SANDBOX')
      end
    end

    context "with sandbox" do
      let(:parameters) do
        {
            :hdfs_external_table => {
                :hadoop_instance_id => hadoop_instance.id,
                :pathname => "foo_fighter/twisted_sisters/",
                :has_header => true,
                :column_names => ["field1", "field2"],
                :types => ["text", "text"],
                :delimiter => ',',
                :table_name => "highway_to_heaven"},
            :workspace_id => workspace.id
        }
      end

      it "creates hdfs external table for a workspace with sandbox amd responds with ok" do
        mock(Hdfs::ExternalTableCreator).create(workspace, instance_account, anything, user)

        post :create, parameters
        response.code.should == "200"
      end
    end

    context "failure to connect to the sandbox" do
      let(:parameters) do
        {
            :hdfs_external_table => {
                :hadoop_instance_id => hadoop_instance.id,
            },
            :workspace_id => workspace.id
        }
      end

      before do
        mock(Hdfs::ExternalTableCreator).create.with_any_args { raise Hdfs::ExternalTableCreator::CreationFailed }
      end

      it "responds with unprocessable entity and add specific errors" do
        post :create, parameters
        response.code.should == "422"

        decoded = JSON.parse(response.body)
        decoded['errors']['fields']['external_table'].should have_key('CONNECTION_REFUSED')
      end
    end

    context "failure to create table in the sandbox" do
      let(:parameters) do
        {
            :hdfs_external_table => {
                :hadoop_instance_id => hadoop_instance.id,
            },
            :workspace_id => workspace.id
        }
      end

      before do
        mock(Hdfs::ExternalTableCreator).create.with_any_args { raise Hdfs::ExternalTableCreator::AlreadyExists }
      end

      it "responds with unprocessable entity and add specific errors" do
        post :create, parameters
        response.code.should == "422"

        decoded = JSON.parse(response.body)
        decoded['errors']['fields']['external_table'].should have_key('EXISTS')
      end
    end
  end
end
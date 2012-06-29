require 'spec_helper'

describe ExternalTablesController do
  let(:user) { FactoryGirl.create(:user) }
  let(:sandbox) { FactoryGirl.create(:gpdb_schema) }
  let(:workspace) { FactoryGirl.create(:workspace, :owner => user, :sandbox => sandbox) }
  let(:workspace_without_sandbox) { FactoryGirl.create(:workspace, :owner => user) }

  let!(:instance_account) { FactoryGirl.create(:instance_account, :owner => user, :instance => sandbox.instance) }
  let(:hadoop_instance) { FactoryGirl.create(:hadoop_instance, :host => "emc.com", :port => '8020') }

  describe "#create" do
    let(:current_user) { user }

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
                :path => "foo_fighter/twisted_sisters/",
                :has_header => true,
                :column_names => ["field1", "field2"],
                :column_types => ["text", "text"],
                :delimiter => ',',
                :table_name => "highway_to_heaven"},
            :workspace_id => workspace.id
        }
      end

      it "creates hdfs external table for a workspace with sandbox amd responds with ok" do
        mock(HdfsExternalTable).create(workspace, instance_account, anything, current_user)

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
        mock(HdfsExternalTable).create.with_any_args { raise HdfsExternalTable::CreationFailed }
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
        mock(HdfsExternalTable).create.with_any_args { raise HdfsExternalTable::AlreadyExists }
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
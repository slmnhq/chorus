require 'spec_helper'

describe AnalyzeController do
  ignore_authorization!
  let(:user) { users(:the_collaborator) }
  let(:gpdb_table) { datasets(:table) }
  let(:gpdb_instance) { gpdb_table.gpdb_instance }
  let(:account) { gpdb_instance.account_for_user!(user) }

  before do
    log_in user
  end

  describe "#create" do
    before do
      fake_result = SqlResult.new
      any_instance_of(GpdbTable) do |gpdb_table|
        stub(gpdb_table).analyze(account) { fake_result }
      end
    end

    it "uses authentication" do
      mock(subject).authorize! :show_contents, gpdb_table.gpdb_instance
      post :create, :table_id => gpdb_table.to_param
    end

    it "reports that the Analyze was created" do
      post :create, :table_id => gpdb_table.to_param
      response.code.should == "200"
    end
  end
end

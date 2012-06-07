require 'spec_helper'

describe AnalyzeController do
  ignore_authorization!
  let(:user) { FactoryGirl.create(:user) }
  let!(:gpdb_table) { FactoryGirl.create(:gpdb_table, :name => "new_table") }
  let(:instance) { gpdb_table.instance }
  let!(:account) { FactoryGirl.create(:instance_account, :instance_id => instance.id, :owner_id => user.id) }

  before do
    log_in user
  end

  describe "#create" do
    before do
      fake_results = SqlResults.new([], [])
      any_instance_of(GpdbTable) do |gpdb_table|
        stub(gpdb_table).analyze(
            account
        ) { fake_results }
      end
    end

    it "uses authentication" do
      mock(subject).authorize! :show, gpdb_table.instance
      post :create, :table_id => gpdb_table.to_param
    end

    it "reports that the Analyze was created" do
      post :create, :table_id => gpdb_table.to_param
      response.code.should == "201"
    end
  end
end

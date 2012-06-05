require 'spec_helper'

describe PreviewsController do
  ignore_authorization!

  let(:gpdb_table) { FactoryGirl.create(:gpdb_table, :name => "new_table") }
  let(:instance) { gpdb_table.instance }
  let(:account) { FactoryGirl.create(:instance_account, :instance_id => instance.id, :owner_id => user.id) }
  let(:user) { FactoryGirl.create(:user) }

  before do
    log_in user
  end

  describe "#create" do
    before do
      fake_results = SqlResults.new([], [])
      stub(SqlResults).preview_database_object(gpdb_table, account) { fake_results }
    end

    it "uses authentication" do
      mock(subject).authorize! :show, gpdb_table.instance
      post :create, :database_object_id => gpdb_table.to_param
    end

    it "reports that the preview was created" do
      post :create, :database_object_id => gpdb_table.to_param
      response.code.should == "201"
    end

    it "renders the preview" do
      post :create, :database_object_id => gpdb_table.to_param
      decoded_response.columns.should_not be_nil
      decoded_response.rows.should_not be_nil
    end
  end
end

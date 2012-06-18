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
      mock(SqlResults).preview_dataset(gpdb_table, account, '0.43214321') { fake_results }
    end

    it "uses authentication" do
      mock(subject).authorize! :show, gpdb_table.instance
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
  end

  describe "#destroy" do
    it "cancels the data preview command" do
      mock(SqlResults).cancel_preview(gpdb_table, account, '0.12341234')
      delete :destroy, :dataset_id => gpdb_table.to_param, :id => '0.12341234'

      response.code.should == '200'
    end
  end
end

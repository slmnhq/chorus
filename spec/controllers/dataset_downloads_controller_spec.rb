require 'spec_helper'

describe DatasetDownloadsController do
  let(:user) { users(:carly) }
  let(:instance_account) { instance_accounts(:iamcarly) }
  let(:table) { datasets(:bobs_table) }

  before do
    log_in user
  end

  describe "#show" do
    it "should response with success" do
      get :show, :dataset_id => table.to_param, :format => 'csv'

      response.code.should == "200"
    end

    it "sets the response body to a dataset streamer enum for the dataset and user" do
      any_instance_of(DatasetStreamer) do |streamer|
        mock(streamer).enum { "i am the enum" }
      end
      get :show, :dataset_id => table.to_param, :format => 'csv'
      response.body.should == 'i am the enum'
      assigns(:streamer).user.should == user
      assigns(:streamer).dataset.should == table
    end

    it "passes the row_limit to the streamer" do
      get :show, :dataset_id => table.to_param, :format => 'csv', :row_limit => '42'
      assigns(:streamer).row_limit.should == '42'
    end

    it "should set the content-type header" do
      get :show, :dataset_id => table.to_param, :format => 'csv'
      response.headers["Content-Disposition"].should == "attachment; filename=#{table.name}.csv"
    end
  end
end
require 'spec_helper'

describe WorkspaceCsvController do
  ignore_authorization!

  let(:user) { FactoryGirl.create(:user) }
  let(:file) { test_file("test.csv", "text/csv") }
  let(:workspace) { FactoryGirl.create(:workspace) }

  before do
    log_in user
  end

  describe "#create" do
    before do
      @params = {
          :workspace_id => workspace.to_param,
          :csv=> {
              :contents => file
          }
      }
    end

    it "returns 100 rows" do
      post "create", @params

      decoded_response['contents'].should have(100).lines
      decoded_response['contents'].should include('99,99,99')
      decoded_response['contents'].should_not include('100,100,100')
    end
  end
end
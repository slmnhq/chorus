require 'spec_helper'

resource "Kaggle", :kaggle_api => true do
  let(:user) { users(:owner) }
  let(:workspace) { workspaces(:public) }
  let(:workspace_id) { workspace.id }

  before do
    log_in user
  end

  get "/workspaces/:workspace_id/kaggle/users" do
    parameter :workspace_id, "Workspace id"
    parameter :'kaggle_user[]', "Array of filters, each with the pipe-separated format: 'filter|comparator|value'"

    example_request "Get a list of Kaggle users" do
      status.should == 200
    end
  end

  post "/workspaces/:workspace_id/kaggle/messages" do
    parameter :workspace_id, "Workspace id"
    parameter :reply_to, "Email address of sender"
    parameter :subject, "Subject of message to Kaggle user"
    parameter :html_body, "Body of message to Kaggle user"
    parameter :'recipient_ids[]', "Kaggle user ids of recipients"

    let(:reply_to) { "user@chorus.com" }
    let(:subject) { 'Please analyze my data'}
    let(:html_body) { 'I have a lot of data that needs to be analyzed.' }
    let(:recipient_ids) { ['63766', '63767'] }

    required_parameters :reply_to, :subject, :html_body, :'recipient_ids[]'

    example "Send a message to Kaggle users" do
      VCR.use_cassette('kaggle_api_spec', :tag => :filter_kaggle_api_key) do
        do_request(:reply_to => reply_to, :subject => subject, :html_body => html_body, :recipient_ids => recipient_ids)
        status.should == 200
      end
    end
  end
end

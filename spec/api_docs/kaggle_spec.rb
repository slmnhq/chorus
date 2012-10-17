require 'spec_helper'

resource "Kaggle" do
  let(:user) { users(:owner) }
  let(:workspace) { workspaces(:public) }
  let(:workspace_id) { workspace.id }

  before do
    log_in user
  end

  get "/workspaces/:workspace_id/kaggle/users" do
    example_request "Get a list of Kaggle users" do
      parameter :kaggle_user, "Array of Filter in format of 'filter|comparator|value'"
      status.should == 200
    end
  end

  post "/workspaces/:workspace_id/kaggle/messages" do
    parameter :from, "Email address of sender"
    parameter :subject, "Subject of message to Kaggle user"
    parameter :message, "Body of message to Kaggle user"
    parameter :recipient_ids, "Kaggle user ids of recipients"

    let(:from) { "user@chorus.com" }
    let(:subject) { 'Please analyze my data'}
    let(:message) { 'I have a lot of data that needs to be analyzed.' }
    let(:recipient_ids) { [1, 2, 3] }

    required_parameters :from, :subject, :message, :recipient_ids

    example_request "Send a message to Kaggle users" do
      status.should == 200
    end
  end
end

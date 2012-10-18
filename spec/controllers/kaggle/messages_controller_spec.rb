require 'spec_helper'

describe Kaggle::MessagesController, :kaggle_api => true do
  let(:user) { users(:owner) }

  before do
    log_in user
  end

  describe "#create" do
    let(:params) { {
        "reply_to" => "chorusadmin@example.com",
        "html_body" => "Example Body",
        "subject" => "Example Subject",
        "recipient_ids" => ["6732"],
        "workspace_id" => "1"
    } }
    it_behaves_like "an action that requires authentication", :post, :create

    it "returns 200 when the message sends" do
      mock(Kaggle::API).send_message(satisfy {|arg| arg.values.select{|v| !v.nil? }.length == 5})

      post :create, params
      response.should be_success
    end

    context 'when the message send fails' do
      before do
        mock(Kaggle::API).send_message(anything) {
          raise Kaggle::API::MessageFailed.new 'This is an arbitrary error message'
        }
      end

      it "presents an error json" do
        post :create, params
        response.code.should == '422'
        decoded_response = JSON.parse(response.body)
        decoded_response['errors']['fields']['kaggle']['GENERIC']['message'].should_not be_nil
      end
    end
  end
end
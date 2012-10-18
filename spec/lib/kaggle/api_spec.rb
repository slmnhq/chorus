require 'spec_helper'

#Test Kaggle User 1
#id: 47822
#email: 2093j0qur890w3ur0@mailinator.com
#Full name: Bruce Banner
#username: bbanner

#Test Kaggle User 2
#id: 51196
#email: jg93904u9fhwe9ry@mailinator.com
#Full name: Tony Stark
#username: tstark

describe Kaggle::API, :kaggle_api => true do
  describe ".send_message" do
    let(:user_ids) { [63766] }
    let(:api_key) { Chorus::Application.config.chorus['kaggle']['api_key'] }
    let(:params) { {
       "subject" => "some subject",
       "replyTo" => "test@fun.com",
       "htmlBody" => "message body",
       "apiKey" => api_key,
       "userId" => user_ids
    } }

    it "should send a message and return true" do
      VCR.use_cassette('kaggle_message_single', :tag => :filter_kaggle_api_key) do
        described_class.send_message(params).should be_true
      end
    end

    context "with multiple recipients as array" do
      let(:user_ids) { [63766,63767] }

      it "succeeds with two valid ids" do
        VCR.use_cassette('kaggle_message_multiple', :tag => :filter_kaggle_api_key) do
          described_class.send_message(params).should be_true
        end
      end
    end

    context "when the send message fails" do
      let(:user_ids) { [99999999] }
      it "fails with an invalid id" do
        VCR.use_cassette('kaggle_message_single_fail', :tag => :filter_kaggle_api_key) do
          expect {
            described_class.send_message(params)
          }.to raise_exception(Kaggle::API::MessageFailed)
        end
      end

      context "with multiple recipients as array" do
        let(:user_ids) { [63766,99999999] }

        it "fails with one invalid id" do
          VCR.use_cassette('kaggle_message_multiple_fail', :tag => :filter_kaggle_api_key) do
            expect {
              described_class.send_message(params)
            }.to raise_exception(Kaggle::API::MessageFailed)
          end
        end
      end
    end

    context "when the API times out" do
      it "raises a kaggle error" do
        any_instance_of(Net::HTTP) do |http|
          stub(http).request { raise Timeout::Error.new }
        end

        expect {
          described_class.send_message(params)
        }.to raise_exception(Kaggle::API::MessageFailed,
                  'Could not connect to the Kaggle server')
      end
    end
  end
end
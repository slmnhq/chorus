require "spec_helper"

describe Hdfs::ContentsController do
  let(:hadoop_instance) { FactoryGirl.create(:hadoop_instance, :host => 'gillette', :port => '8020', :username => 'pivotal') }

  before do
    log_in FactoryGirl.create :user
  end

  describe "#show" do
    it "show file content" do
      VCR.use_cassette('query_service_entry_and_content') do
        get :show, :hadoop_instance_id => hadoop_instance.id, :id => '/data/test.csv'

        response.code.should == '200'
        decoded_response[:last_updated_stamp].should_not be_blank
        decoded_response[:contents].should include('a, b, c')
      end
    end

    generate_fixture "hdfsFile.json" do
      VCR.use_cassette('query_service_entry_and_content') do
        get :show, :hadoop_instance_id => hadoop_instance.id, :id => '/data/test.csv'
      end
    end
  end
end
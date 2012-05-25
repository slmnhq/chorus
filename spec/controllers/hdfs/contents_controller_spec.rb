require "spec_helper"

describe Hdfs::ContentsController do
  let(:hadoop_instance) { FactoryGirl.create(:hadoop_instance) }

  before do
    log_in FactoryGirl.create :user
  end

  describe "#show" do
    before do
      service = Object.new
      mock(Hdfs::QueryService).new(hadoop_instance) { service }
      mock(service).show('/file') { ["content"] }
    end

    it "show file content" do
      get :show, :hadoop_instance_id => hadoop_instance.id, :id => '/file'
      parsed_response = JSON.parse(response.body)

      response.code.should == '200'
      parsed_response['response']['contents'].should include('content')
    end
  end
end
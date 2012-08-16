require "spec_helper"

describe Hdfs::ContentsController do
  let(:hadoop_instance) { FactoryGirl.create(:hadoop_instance, :host => HADOOP_TEST_INSTANCE, :port => '8020', :username => 'pivotal') }

  before do
    log_in FactoryGirl.create :user
  end

  describe "#show" do
    before do
      any_instance_of(Hdfs::QueryService) do |h|
        stub(h).show { ["a, b, c", "row1a, row1b, row1c"] }
        stub(h).list { [{'modified_at' => Time.now.to_s, 'path' => '/data/test.csv'}] }
      end
    end

    it "shows file content" do
      get :show, :hadoop_instance_id => hadoop_instance.id, :id => '/data/test.csv'

      pending
      response.code.should == '200'
      decoded_response[:last_updated_stamp].should_not be_blank
      decoded_response[:contents].should include('a, b, c')
    end

    generate_fixture "hdfsFile.json" do
      get :show, :hadoop_instance_id => hadoop_instance.id, :id => '/data/test.csv'
    end
  end
end
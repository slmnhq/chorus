require "spec_helper"

describe Hdfs::ContentsController do
  let(:hadoop_instance) { FactoryGirl.create(:hadoop_instance) }

  before do
    log_in FactoryGirl.create :user

    service = Object.new
    mock(Hdfs::QueryService).new(hadoop_instance) { service }
    mock(service).show('/file') { ["column1,column2,column3", "item1,item2,item3"] }

    entry_stub = Object.new
    stub(entry_stub).modified_at { Time.current }
    mock(HdfsEntry).list('/file', hadoop_instance) { [entry_stub] }
  end

  describe "#show" do
    it "show file content" do
      get :show, :hadoop_instance_id => hadoop_instance.id, :id => '/file'

      response.code.should == '200'
      decoded_response[:contents].should include("column1,column2,column3")
      decoded_response[:contents].should include("item1,item2,item3")
    end

    generate_fixture "hdfsFile.json" do
      get :show, :hadoop_instance_id => hadoop_instance.id, :id => '/file'
    end
  end
end
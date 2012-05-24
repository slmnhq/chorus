require "spec_helper"

describe Hdfs::FilesController do
  let(:hadoop_instance) { FactoryGirl.create :hadoop_instance }
  let(:entry) do
    HdfsEntry.new('path' => '/empty', 'modifiedAt' => Time.now.to_s)
  end

  before do
    log_in FactoryGirl.create :user
  end

  describe "index" do
    before do
      mock(HdfsEntry).list('/', hadoop_instance) { [entry] }
    end

    it "renders the list of entries on root" do
      get :index, :hadoop_instance_id => hadoop_instance.id

      response.code.should == "200"
      parsed_response = JSON.parse(response.body)
      parsed_response.should have(1).item
    end
  end

  describe "show" do
    context "clean id" do
      before do
        mock(HdfsEntry).list('/data/', hadoop_instance) { [entry] }
      end

      it "renders the path correctly, appending slashes" do
        get :show, :hadoop_instance_id => hadoop_instance.id, :id => 'data'

        response.code.should == "200"
        parsed_response = JSON.parse(response.body)
        parsed_response.should have(1).item
      end
    end

    context "id with symbol" do
      before do
        mock(HdfsEntry).list('/data%12?3/', hadoop_instance) { [entry] }
      end

      it "renders the path correctly, appending slashes" do
        get :show, :hadoop_instance_id => hadoop_instance.id, :id => 'data%12?3'

        response.code.should == "200"
        parsed_response = JSON.parse(response.body)
        parsed_response.should have(1).item
      end
    end
  end
end
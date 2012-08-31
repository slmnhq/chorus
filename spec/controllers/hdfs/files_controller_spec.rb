require "spec_helper"

describe Hdfs::FilesController do
  let(:hadoop_instance) { FactoryGirl.create :hadoop_instance }
  let(:entry) do
    HdfsEntry.create!({:path => '/data', :modified_at => Time.now.to_s, :hadoop_instance => hadoop_instance}, :without_protection => true)
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
    before do
      mock(HdfsEntry).list('/data/', hadoop_instance) { [entry] }
    end

    it "renders the path correctly, appending slashes" do
      get :show, :hadoop_instance_id => hadoop_instance.id, :id => entry.id

      response.code.should == "200"
      parsed_response = JSON.parse(response.body)
      parsed_response.should have(1).item
    end
  end
end
require "spec_helper"

describe Hdfs::FilesController do
  let(:hadoop_instance) { FactoryGirl.create :hadoop_instance }
  let(:entry) do
    HdfsEntry.create!({:is_directory => true, :path => '/data', :modified_at => Time.now.to_s, :hadoop_instance => hadoop_instance}, :without_protection => true)
  end

  before do
    log_in FactoryGirl.create :user
  end

  describe "index" do

    before do
      mock(HdfsEntry).list('/', hadoop_instance) { [entry] }
    end

    it "renders the list of entries on root" do
      entry
      get :index, :hadoop_instance_id => hadoop_instance.id

      response.code.should == "200"
      parsed_response = JSON.parse(response.body)
      parsed_response.should have(1).item
    end
  end

  describe "show" do
    context "a directory" do

      before do
        mock(HdfsEntry).list('/data/', hadoop_instance) { [entry] }
      end

      it "renders the path correctly, appending slashes" do
        get :show, :hadoop_instance_id => hadoop_instance.id, :id => entry.id

        response.code.should == "200"
        parsed_response = JSON.parse(response.body)
        parsed_response.should have(1).item
      end

      generate_fixture "hdfsDir.json" do
        get :show, :hadoop_instance_id => hadoop_instance.id, :id => entry.id
      end
    end

    context "a file" do

      let(:entry) do
        HdfsEntry.create!({:is_directory => false, :path => '/data/test.csv', :modified_at => Time.now.to_s, :hadoop_instance => hadoop_instance}, :without_protection => true)
      end
      before do
        any_instance_of(Hdfs::QueryService) do |h|
          stub(h).show { ["a, b, c", "row1a, row1b, row1c"] }
          stub(h).list { [{'modified_at' => Time.now.to_s, 'path' => '/data/test.csv'}] }
        end
      end

      it "shows file content" do
        get :show, :hadoop_instance_id => hadoop_instance.id, :id => entry.id
        response.code.should == '200'
        decoded_response[:last_updated_stamp].should_not be_blank
        decoded_response[:contents].should include('a, b, c')
      end

      generate_fixture "hdfsFile.json" do
        get :show, :hadoop_instance_id => hadoop_instance.id, :id => entry.id
      end
    end
  end
end

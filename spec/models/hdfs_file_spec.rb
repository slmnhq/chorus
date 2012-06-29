require 'spec_helper'

describe HdfsFile do
  let(:time) { Time.current }
  let(:hadoop_instance) { FactoryGirl.build_stubbed(:hadoop_instance) }

  subject { described_class.new('/file', hadoop_instance, {:modified_at => time}) }

  describe "#contents" do
    before do
      service = Object.new
      mock(Hdfs::QueryService).new(hadoop_instance) { service }
      mock(service).show('/file') { ["content"] }
    end

    it "retrieves file content from the query service" do
      subject.contents.should == ['content']
    end
  end

  describe "#hadoop_instance" do
    it "returns the hadoop instance associated with the file" do
      subject.hadoop_instance.should == hadoop_instance
    end
  end

  describe "#path" do
    it "returns the full path of the file" do
      subject.path.should == '/file'
    end
  end

  describe "#modified_at" do
    it "returns the date of modification" do
      subject.modified_at.should == time
    end
  end
end
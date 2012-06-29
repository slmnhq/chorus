require 'spec_helper'

describe HdfsFilePresenter, :type => :view do
  let(:presenter) { described_class.new(hdfs_file, view) }
  let(:hadoop_instance) { FactoryGirl.build_stubbed(:hadoop_instance) }

  let(:hdfs_file) do
    Object.new.tap do |hdfs_file|
      mock(hdfs_file).contents { ["line1", "line2", "line3"] }
      mock(hdfs_file).hadoop_instance { hadoop_instance }
      mock(hdfs_file).path { "/my/path/to/file" }
      mock(hdfs_file).modified_at { Time.new(2010, 10, 20, 10, 11, 12) }
    end
  end

  subject { presenter.to_hash }

  describe "#to_hash" do
    it "includes the path" do
      subject[:path].should == '/my/path/to/file'
    end

    it "includes the related hadoop instance" do
      subject[:hadoop_instance][:name].should include("instance")
    end

    it "includes the contents of the file" do
      subject[:contents].should == ['line1', 'line2', 'line3']
    end

    it "includes the last modification time" do
      subject[:last_updated_stamp].should == "2010-10-20 10:11:12"
    end
  end
end
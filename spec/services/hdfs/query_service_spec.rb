require 'spec_helper'
require 'java'

describe Hdfs::QueryService do
  before :all do
    # silence the HDFS log output from failed version connections
    @java_stdout = java.lang.System.out
    @java_stderr = java.lang.System.err
    java.lang.System.setOut(nil)
    java.lang.System.setErr(nil)
  end

  after :all do
    java.lang.System.setOut(@java_stdout)
    java.lang.System.setErr(@java_stderr)
  end

  describe ".instance_version" do
    context "existing hadoop server" do
      let(:instance) do
        HadoopInstance.new :host => HADOOP_TEST_INSTANCE, :port => "8020", :username => "pivotal"
      end

      it "returns the hadoop version" do
        version = described_class.instance_version(instance)
        version.should == "0.20.1gp"
      end
    end

    context "unexisting hadoop server" do
      let(:unexisting_instance) do
        HadoopInstance.new :host => "garbage", :port => "8888", :username => "pivotal"
      end

      it "raises ApiValidationError" do
        expect { described_class.instance_version(unexisting_instance) }.to raise_error(ApiValidationError)
      end
    end

    context "timeout" do
      let(:slow_instance) do
        HadoopInstance.new :host => HADOOP_TEST_INSTANCE, :port => "8888", :username => "pivotal"
      end
    end
  end

  describe "#list" do
    let(:service) { Hdfs::QueryService.new(HADOOP_TEST_INSTANCE, "8020", "pivotal", "0.20.1gp") }

    context "listing root with sub content" do
      it "returns list of content for root directory" do
        response = service.list("/")
        response.count.should > 2
      end
    end

    context "listing empty directory" do
      it "should return an array with zero length" do
        response = service.list("/empty/")
        response.should have(0).files
      end
    end

    context "listing non existing directory" do
      it "should return an error" do
        expect { service.list("/non_existing/") }.to raise_error(Hdfs::DirectoryNotFoundError)
      end
    end

    context "connection is invalid" do
      let(:service) { Hdfs::QueryService.new("garbage", "8020", "pivotal", "0.20.1gp") }

      it "raises an exception" do
        expect { service.list("/") }.to raise_error(Hdfs::DirectoryNotFoundError)
      end
    end
  end

  describe "#show" do
    let(:service) { Hdfs::QueryService.new(HADOOP_TEST_INSTANCE, "8020", "pivotal", "0.20.1gp") }

    context "show an existing file" do
      it "should return part of the content" do
        response = service.show("/data/test.csv")
        response.should_not be_empty
        response.should include("a, b, c")
      end
    end

    context "show a non existing file" do
      it "should return an error" do
        expect { service.show("/file") }.to raise_error(Hdfs::FileNotFoundError)
      end
    end

    context "connection is invalid" do
      let(:service) { Hdfs::QueryService.new("garbage", "8020", "pivotal", "0.20.1gp") }

      it "raises an exception" do
        expect { service.show("/file") }.to raise_error(Hdfs::FileNotFoundError)
      end
    end
  end
end

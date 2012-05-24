require 'spec_helper'

describe Hdfs::QueryService do
  describe ".instance_version" do
    context "existing hadoop server" do
      let(:instance) do
        HadoopInstance.new :host => "garcia", :port => "8020", :username => "pivotal"
      end

      it "returns the hadoop version" do
        VCR.use_cassette("query_service_existing_hadoop_server") do
          version = described_class.instance_version(instance)
          version.should == "1.0.0"
        end
      end
    end

    context "unexisting hadoop server" do
      let(:unexisting_instance) do
        HadoopInstance.new :host => "garcia1", :port => "8888", :username => "pivotal"
      end

      it "returns nil" do
        VCR.use_cassette("query_service_unexisting_server") do
          version = described_class.instance_version(unexisting_instance)
          version.should be_nil
        end
      end
    end
  end

  describe "#list" do
    before do
      instance = HadoopInstance.new :name => "instance", :host => "garcia", :port => "8020", :username => "pivotal";
      @service = Hdfs::QueryService.new(instance)
    end

    context "listing root with sub content" do
      it "returns list of content for root directory" do
        VCR.use_cassette("query_service_list_root") do
          response = @service.list("/")
          response.should have(4).files
        end
      end
    end

    context "listing empty directory" do
      it "should return an array with zero length" do
        VCR.use_cassette("query_service_list_empty_dir") do
          response = @service.list("/empty/")
          response.should have(0).files
        end
      end
    end

    context "listing non existing directory" do
      it "should return an error" do
        VCR.use_cassette("query_service_list_nonexisting_dir") do
          response = @service.list("/non_existing/")
          response.should have(0).files
        end
      end
    end
  end

  describe "#show" do
    before do
      instance = HadoopInstance.new :name => "instance", :host => "garcia", :port => "8020", :username => "pivotal";
      @service = Hdfs::QueryService.new(instance)
    end

    context "show an existing file" do
      it "should return part of the content" do
        VCR.use_cassette("query_service_show_file") do
          response = @service.show("/filetypes/AccountMapHelper.java");

          response.should_not be_empty
          response.should include("EMC Corporation All Rights Reserved")
        end
      end
    end

    context "show a non existing file" do
      it "should return an error" do
        VCR.use_cassette("query_service_show_nonexisting_file") do
          response = @service.show("/file")
          response.should be_empty
        end
      end
    end
  end
end
require 'spec_helper'

describe Hdfs::ConnectionBuilder do
  let(:instance) do
    FactoryGirl.build(:hadoop_instance,
      :host => "gillette",
      :port => 8020,
      :version => "0.20.205.0"
    )
  end

  let(:client) { Hdfs::ConnectionBuilder.new(instance) }

  describe ".check(instance)" do
    before do
      any_instance_of(Hdfs::ConnectionBuilder) do |builder|
        stub(builder).run_hadoop(anything) { "successful response" }
      end
    end

    it "check the validation of instance attributes, before checking connection" do
      instance.host = nil
      expect { Hdfs::ConnectionBuilder.check!(instance) }.to raise_error ActiveRecord::RecordInvalid
    end

    it "requires that a command can be run on the hadoop instance" do
      any_instance_of(Hdfs::ConnectionBuilder) do |builder|
        mock(builder).run_hadoop(anything) { raise ApiValidationError }
      end

      expect {
        Hdfs::ConnectionBuilder.check!(instance)
      }.to raise_error ApiValidationError
    end

    it "sets the instance's status to be 'online''" do
      Hdfs::ConnectionBuilder.check!(instance)
      instance.should be_online
    end
  end

  describe "#hadoop_binary" do
    context "when the instance's version is present in `config/hadoop.yml'" do
      it "returns the path to the correct hadoop client binary" do
        instance.version = "0.20.205.0"
        client.hadoop_binary.should == "vendor/hadoop/0.20.205.0/bin/hadoop"
      end
    end

    context "when the instance's version is NOT present in `config/hadoop.yml'" do
      it "returns nil" do
        instance.version = "9.9.9.9"
        client.hadoop_binary.should be_nil
      end
    end
  end

  describe "#run_hadoop(command)" do
    let(:hadoop_command) { "ls /" }
    let(:expected_shell_command) { "#{fake_binary_path} dfs -fs hdfs://gillette:8020 -ls /" }
    let(:fake_binary_path) { "vendor/hadoop/SOME_VERSION/hadoop/bin" }

    before do
      mock(client).hadoop_binary { fake_binary_path }
    end

    it "runs the given hadoop command with the right host and port" do
      mock(Open3).capture3(expected_shell_command)
      client.run_hadoop(hadoop_command)
    end

    context "when the command writes to stderr" do
      it "raises an exception" do
        mock(Open3).capture3(expected_shell_command) { ["", "hadoop client stderr", 0] }
        expect {
          client.run_hadoop(hadoop_command)
        }.to raise_error(ApiValidationError)
      end
    end

    context "when the command succeeds (nothing written to stderr)" do
      it "returns the command's stdout" do
        mock(Open3).capture3(expected_shell_command) { ["hadoop client stdout", "", 0] }
        client.run_hadoop(hadoop_command).should == "hadoop client stdout"
      end
    end
  end
end


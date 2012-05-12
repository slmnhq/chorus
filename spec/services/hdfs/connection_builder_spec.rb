require 'spec_helper'

describe Hdfs::ConnectionBuilder do
  let(:instance) do
    FactoryGirl.build(:hadoop_instance, :host => "gillette", :port => 8020)
  end

  let(:client) { Hdfs::ConnectionBuilder.new(instance) }

  it "set the JAVA_HOME environment variable " do
    ENV["JAVA_HOME"].should == Hdfs::ConnectionBuilder::CONFIG['java_home']
  end

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

  describe ".find_version(instance)" do
    let(:fake_versions) { ["0.1", "0.2", "0.3"] }

    let(:fake_commands) do
      fake_versions.map {|version| "vendor/hadoop/#{version}/bin/hadoop dfs -fs hdfs://gillette:8020 -ls /" }
    end

    before do
      stub(Hdfs::ConnectionBuilder).supported_versions { fake_versions}
      fake_commands.each_with_index do |cmd, i|
        stub(Open3).capture3(cmd) { fake_responses[i] }
      end
    end

    context "when connection succeeds with the first hadoop version" do
      let(:fake_responses) do
        [
          ["stdout", "", 0],
          ["", "stderr", 0],
          ["", "stderr", 0]
        ]
      end

      it "returns the first version" do
        Hdfs::ConnectionBuilder.find_version(instance).should == "0.1"
      end
    end

    context "when connection succeeds with the second hadoop version" do
      let(:fake_responses) do
        [
          ["", "stderr", 0],
          ["stdout", "", 0],
          ["", "stderr", 0]
        ]
      end

      it "updates the instance's version correctly" do
        Hdfs::ConnectionBuilder.find_version(instance).should == "0.2"
      end
    end

    context "when none of the known hadoop clients successfully connect" do
      let(:fake_responses) do
        [
          ["", "stderr", 0],
          ["", "stderr", 0],
          ["", "stderr", 0]
        ]
      end

      it "sets the instance's version to nil" do
        Hdfs::ConnectionBuilder.find_version(instance).should be_nil
      end
    end
  end

  describe ".hadoop_binary(version)" do
    context "when the given version is present in the hadoop config file" do
      it "returns the path to the correct hadoop client binary" do
        Hdfs::ConnectionBuilder.hadoop_binary("0.20.205.0").should == "vendor/hadoop/0.20.205.0/bin/hadoop"
      end
    end

    context "when the version is NOT present in the hadoop config file" do
      it "returns nil" do
        Hdfs::ConnectionBuilder.hadoop_binary("9.9.9.9").should be_nil
      end
    end
  end

  describe "#run_hadoop(command, [ version ])" do
    let(:hadoop_command) { "ls /" }
    let(:expected_shell_command) { "#{fake_binary_path} dfs -fs hdfs://gillette:8020 -ls /" }
    let(:fake_binary_path) { "vendor/hadoop/SOME_VERSION/hadoop/bin" }
    let(:version) { "0.1.2.3" }

    before do
      mock(Hdfs::ConnectionBuilder).hadoop_binary(version) { fake_binary_path }
    end

    it "runs the given hadoop command with the right host and port" do
      mock(Open3).capture3(expected_shell_command) { ["ok", "", 0]}
      client.run_hadoop(hadoop_command, version)
    end

    context "when the command writes to stderr" do
      it "raises an exception" do
        mock(Open3).capture3(expected_shell_command) { ["", "hadoop client stderr", 0] }
        expect {
          client.run_hadoop(hadoop_command, version)
        }.to raise_error(ApiValidationError)
      end
    end

    context "when the command fails (exit code non-zero)" do
      it "raises an exception" do
        mock(Open3).capture3(expected_shell_command) { ["JAVA_HOME is not set", "", 1] }
        expect {
          client.run_hadoop(hadoop_command, version)
        }.to raise_error(ApiValidationError)
      end
    end

    context "when the command succeeds (nothing written to stderr, exit code 0)" do
      it "returns the command's stdout" do
        mock(Open3).capture3(expected_shell_command) { ["hadoop client stdout", "", 0] }
        client.run_hadoop(hadoop_command, version).should == "hadoop client stdout"
      end
    end
  end
end


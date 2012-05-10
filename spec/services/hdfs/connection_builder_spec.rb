require 'spec_helper'

describe Hdfs::ConnectionBuilder do
  let(:instance) { FactoryGirl.build(:hadoop_instance, :host => "gillette", :port => 8020) }
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

  describe "#run_hadoop(command)" do
    let(:hadoop_command) { "ls /" }
    let(:expected_shell_command) { "bin/hadoop fs -fs hdfs://gillette:8020 -ls /" }

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


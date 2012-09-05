require_relative "../../packaging/install"
require_relative "../../packaging/version_detector"
require 'fakefs/spec_helpers'

describe VersionDetector do
  include FakeFS::SpecHelpers

  let(:detector) { VersionDetector.new(destination_path) }
  let(:destination_path) { '/opt/chorus' }

  describe "#has_2_2_installed?" do
    subject { detector.has_2_2_installed? }

    context "when there is a releases folder" do
      before do
        FileUtils.mkdir_p(File.join(destination_path, "releases"))
      end

      context "but nothing in it" do
        it { should be_false }
      end

      context "with a release in it" do
        before do
          FileUtils.mkdir_p(File.join(destination_path, "releases", "2.2.2.2"))
        end
        it { should be_true }
      end
    end

    context "when there isn't a releases folder" do
      it { should be_false }
    end
  end

  describe "#most_recent_version" do
    subject { detector.most_recent_version }

    context "when there are multiple 2.2 releases" do
      before do
        FileUtils.mkdir_p(File.join(destination_path, "releases", "2.2.0.1-8840ae71c"))
        FileUtils.mkdir_p(File.join(destination_path, "releases", "2.2.0.2-8840ae71c"))
        FileUtils.mkdir_p(File.join(destination_path, "releases", "2.2.0.0-8840ae71c"))
      end

      it { should == "2.2.0.2-8840ae71c" }
    end

    context "when there are no 2.2 releases" do
      it { should be_nil }
    end
  end

  describe "#can_upgrade_legacy?" do
    subject { detector.can_upgrade_legacy? }

    context "when the currently installed version is 2.2" do
      before do
        FileUtils.mkdir_p(File.join(destination_path, "releases", "2.2.0.1-8840ae71c"))
      end

      it { should be_false }
    end

    context "when the currently installed version is 2.1" do
      before do
        FileUtils.mkdir_p(File.join(destination_path, "conf"))
        File.open(File.join(destination_path, 'conf', 'chorus.conf'), 'w') do |f|
          f.puts "chorus.version=2.1.0"
        end
      end

      it { should be_true }
    end

    context "when the currently installed version is 2.0" do
      before do
        FileUtils.mkdir_p(File.join(destination_path, "conf"))
        File.open(File.join(destination_path, 'conf', 'chorus.conf'), 'w') do |f|
          f.puts "chorus.version=2.0.1"
        end
      end

      it "should raise upgrade_to_2_1_required" do
        expect { subject }.to raise_error(Install::UpgradeTo21Required)
      end
    end

    context "when the currently installed version is < 2.0" do
      before do
        FileUtils.mkdir_p(File.join(destination_path, "conf"))
        File.open(File.join(destination_path, 'conf', 'chorus.conf'), 'w') do |f|
          f.puts "chorus.version=1.9.9"
        end
      end

      it "should raise upgrade_unsupported" do
        expect { subject }.to raise_error(Install::UpgradeUnsupported)
      end
    end

    context "when there is no currently installed version" do
      it { should be_false }
    end
  end

  describe "#can_upgrade_2_2?" do
    subject { detector.can_upgrade_2_2? version }
    let(:version) { '2.2.0.1-8840ae71c' }

    context "when the most recent installed version is more recent" do
      before do
        FileUtils.mkdir_p(File.join(destination_path, "releases", "2.2.0.2-8840ae71c"))
      end

      it "should raise InvalidVersion" do
        expect { subject }.to raise_error(Install::InvalidVersion)
      end
    end

    context "when the most recent installed version is the same" do
      before do
        FileUtils.mkdir_p(File.join(destination_path, "releases", version))
      end

      it "should raise AlreadyInstalled" do
        expect { subject }.to raise_error(Install::AlreadyInstalled)
      end
    end

    context "when the most recent installed version is older" do
      before do
        FileUtils.mkdir_p(File.join(destination_path, "releases", "2.2.0.0-8840ae71c"))
      end

      it { should be_true }
    end

    context "when there is no most recent installed version" do
      it { should be_false }
    end
  end
end

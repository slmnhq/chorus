require_relative "../../packaging/install/version_detector"
require 'fakefs/spec_helpers'

describe VersionDetector do
  include FakeFS::SpecHelpers

  let(:detector) { described_class.new(destination_path) }
  let(:destination_path) { '/opt/chorus' }

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
        expect { subject }.to raise_error(InstallerErrors::InstallAborted, /Chorus must be upgraded to 2.1 before it can be upgraded to 2.2/)
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
        expect { subject }.to raise_error(InstallerErrors::InstallAborted, /Chorus cannot upgrade from existing installation/)
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
        FileUtils.mkdir_p(File.join(destination_path, "releases", "2.2.0.1-8840ae71c"))
        FileUtils.mkdir_p(File.join(destination_path, "releases", "2.2.0.2-8840ae71c"))
        FileUtils.mkdir_p(File.join(destination_path, "releases", "2.2.0.0-8840ae71c"))
      end

      it "should raise InvalidVersion" do
        expect { subject }.to raise_error(InstallerErrors::InstallAborted, /Version .* is older than currently installed version \(.*\)./)
      end
    end

    context "when the most recent installed version is the same" do
      before do
        FileUtils.mkdir_p(File.join(destination_path, "releases", version))
      end

      it "should raise AlreadyInstalled" do
        expect { subject }.to raise_error(InstallerErrors::AlreadyInstalled)
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

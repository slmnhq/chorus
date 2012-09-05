require 'fileutils'

class VersionDetector
  def initialize(destination_path)
    @destination_path = destination_path
  end

  def has_2_2_installed?
    !installed_2_2_versions.empty?
  end

  def most_recent_version
    installed_2_2_versions.map { |path| File.basename(path) }.max do |a, b|
      compare_versions a, b
    end
  end

  def can_upgrade_legacy?
    case legacy_version
      when nil
        false
      when '2.1'
        true
      when '2.0'
        raise Install::UpgradeTo21Required
      else
        raise Install::UpgradeUnsupported
    end
  end

  def can_upgrade_2_2?(version)
    return false unless has_2_2_installed?

    version_comparison = compare_versions most_recent_version, version
    if version_comparison > 0
      raise Install::InvalidVersion, "Version #{version} is older than currently installed version (#{most_recent_version})."
    elsif version_comparison == 0
      raise Install::AlreadyInstalled
    end

    true
  end

  private

  def compare_versions(version_a, version_b)
    version_a.split('.').map(&:to_i) <=> version_b.split('.').map(&:to_i)
  end

  def installed_2_2_versions
    Dir[File.join(@destination_path, "releases", "*")]
  end

  def legacy_version
    conf_file = File.join(@destination_path, 'conf', 'chorus.conf')
    return nil unless File.exists?(conf_file)
    contents = File.read(conf_file).strip
    contents =~ /^chorus\.version=(\d+\.\d+)/
    $1
  end
end
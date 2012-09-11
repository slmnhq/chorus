#!./chorus_installation/bin/ruby

require_relative 'chorus_installation/packaging/install/version_detector'
require_relative 'chorus_installation/packaging/install/chorus_logger'
require_relative 'chorus_installation/packaging/install/installer_io'
require_relative 'chorus_installation/packaging/install/chorus_installer'

if __FILE__ == $0
  begin
    installer = ChorusInstaller.new({
        installer_home: File.dirname(__FILE__),
        silent: ARGV.include?('-a'),
        version_detector: VersionDetector.new,
        logger: ChorusLogger.new,
        io: InstallerIO.new(ARGV.include?('-a'))
    })

    installer.install
    installer.startup

    puts "Installation completed."
    puts "run ./server_control.sh start from #{installer.destination_path} to start everything up!" unless installer.do_upgrade
  rescue InstallerErrors::InstallationFailed => e
    #installer.remove_and_restart_previous!
    exit 1
  rescue => e
    File.open("install.log", "a") { |f| f.puts "#{e.class}: #{e.message}" }
    puts "Failed to start chorus back up"
    exit 1
  end
end
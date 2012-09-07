require_relative 'installer_errors'

class InstallerIO
  def initialize(silent=false)
    @silent = !!silent
  end

  def silent?
    @silent
  end

  def log(text)
    puts text
  end

  def prompt(message, default=nil)
    print "\n#{MESSAGES[message]}#{default.nil? ? '' : "[#{default}]:"} "
    get_input
  end

  def prompt_or_default(message, default)
    return default if silent?

    prompt(message, default) || default
  end

  def require_confirmation(message)
    user_input = prompt_or_default(message, 'y')
    unless %w(y yes).include? user_input.downcase
      raise InstallerErrors::InstallAborted, "Cancelled by user."
    end
  end

  def prompt_until(message, &block)
    input = nil
    begin
      input = prompt message
    end until yield input
    input
  end

  MESSAGES = {
      destination_path: "Please enter Chorus destination path",
      confirm_upgrade: "Existing version of Chorus detected. Upgrading will restart services.  Continue now?",
      confirm_legacy_upgrade: "Chorus 2.1 installation detected, do you want to upgrade to 2.2?",
      legacy_destination_path: "Chorus 2.2 cannot be installed in the same directory as 2.1, please provide an empty directory",
      select_os: <<-TEXT
Could not detect your Linux version. Please select one of the following:
  [1] - RedHat (CentOS/RHEL) 5.5 or compatible
  [2] - RedHat (CentOS/RHEL) 6.2 or compatible
  [3] - SuSE Enterprise Linux Server 11 or compatible
  [4] - Abort install
      TEXT
  }

  private

  def get_input
    input = gets.strip
    input.empty? ? nil : input
  end
end
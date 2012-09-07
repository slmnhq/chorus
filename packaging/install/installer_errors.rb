module InstallerErrors
  class InstallationFailed < StandardError
    def initialize(message=nil)
      if message.nil?
        super "Installation failed. Please check install.log for details"
      else
        super "Installation failed: #{message}"
      end
    end
  end

  CommandFailed = Class.new(InstallationFailed)

  class InstallAborted < StandardError
    def initialize(message)
      super "Aborting install: #{message}"
    end
  end

  class AlreadyInstalled < StandardError
    def initialize
      super "This version is already installed."
    end
  end
end
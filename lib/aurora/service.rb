require_relative 'java_modules'

module Aurora
  InvalidService = Class.new(StandardError)

  DB_SIZE = {
    :small =>  JavaModules::AuroraDBTemplate.small,
    :medium => JavaModules::AuroraDBTemplate.medium,
    :large =>  JavaModules::AuroraDBTemplate.large,
  }

  class Service
    def initialize(aurora_properties_path)
      config_path = aurora_properties_path.to_s
      @aurora_service = JavaModules::AuroraService.get_instance(JavaModules::AuroraConfig.load_config(config_path))
      @valid = true
    rescue StandardError
      @valid = false
    end

    def all_databases
      raise InvalidService unless @valid

      @aurora_service.all_databases
    end

    def valid?
      @valid
    end

    def templates
      return [] unless @valid

      @aurora_service.get_template_for_chorus.map do |java_template|
        Template.new(java_template)
      end
    end

    def create_database(options)
      raise InvalidService unless @valid

      @aurora_service.create_database(
        options[:template],
        options[:db_name],
        options[:db_user],
        options[:db_password],
        options[:storage_size_in_gb]
      )
    end
  end
end

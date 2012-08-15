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

    def find_template_by_name(name)
      @aurora_service.get_template_for_chorus.find do |template|
        template.name == name
      end
    end

    def create_database(options)
      raise InvalidService unless @valid

      @aurora_service.create_database(
        options[:template],
        options[:database_name],
        options[:db_username],
        options[:db_password],
        options[:size].to_i
      )
    end
  end
end

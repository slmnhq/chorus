require_relative 'java_modules'

module Aurora
  DB_SIZE = {
    :small =>  Java::AuroraDBTemplate.small,
    :medium => Java::AuroraDBTemplate.medium,
    :large =>  Java::AuroraDBTemplate.large,
  }

  class Service
    def initialize(aurora_properties_path)
      config_path = aurora_properties_path.to_s
      @aurora_service = Java::AuroraService.get_instance(Java::AuroraConfig.load_config(config_path))
    end

    def all_databases
      @aurora_service.all_databases
    end

    def create_database(options)
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

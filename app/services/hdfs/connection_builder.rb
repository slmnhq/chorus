require "open3"

module Hdfs
  class ConnectionBuilder
    CONFIG = YAML.load_file(File.expand_path("config/hadoop.yml", Rails.root))
    ENV["JAVA_HOME"] = CONFIG['java_home']

    def self.check!(instance)
      validate_model!(instance)
      new(instance).run_hadoop("ls /")
      instance.online = true
      true
    end

    def self.validate_model!(model)
      model.valid? || raise(ActiveRecord::RecordInvalid.new(model))
    end

    def self.find_version(instance)
      builder = new(instance)
      supported_versions.find do |version|
        begin
          builder.run_hadoop("ls /", version)
          true
        rescue ApiValidationError
          false
        end
      end
    end

    def initialize(instance)
      @instance = instance
    end

    def run_hadoop(command, version=nil)
      binary = self.class.hadoop_binary(version || @instance.version)
      out, err, exit = Open3.capture3("#{binary} dfs -fs hdfs://#{@instance.host}:#{@instance.port} -#{command}")
      raise ApiValidationError if (err.present? || exit != 0)
      out
    end

    def self.hadoop_binary(version)
      if supported_versions.include? version
        "vendor/hadoop/#{version}/bin/hadoop"
      end
    end

    def self.supported_versions
      @supported_versions ||= CONFIG['versions'].keys
    end
  end
end

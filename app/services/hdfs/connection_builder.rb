require "open3"

module Hdfs
  class ConnectionBuilder
    def self.check!(instance)
      validate_model!(instance)
      new(instance).run_hadoop("ls /")
      instance.state = "online"
      true
    end

    def self.validate_model!(model)
      model.valid? || raise(ActiveRecord::RecordInvalid.new(model))
    end

    def initialize(instance)
      @instance = instance
    end

    def run_hadoop(command)
      out, err = Open3.capture3("bin/hadoop fs -fs hdfs://#{@instance.host}:#{@instance.port} -#{command}")
      raise ApiValidationError if err.present?
      out
    end
  end
end

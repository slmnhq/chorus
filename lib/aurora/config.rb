require_relative 'java_modules'

module Aurora
  class Config < JavaModules::AuroraConfig

    def initialize
      super "/dev/null"
    end

    def load(config)
      config.each do |key, value|
        send("#{key}=", value_for_key(key, value))
      end
    end

    def value_for_key(key, value)
      return value.to_i if key == :gpfdist_port

      value
    end
  end
end
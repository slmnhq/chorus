require 'httparty'

module Hdfs
  class QueryService
    SERVICE_HOST = YAML.load_file(Rails.root.join("config", "hadoop.yml"))["query_service_url"]

    def self.instance_version(instance)
      new(instance).version
    end

    def initialize(instance)
      @query = {
        :host => instance.host,
        :port => instance.port,
        :username => instance.username,
      }
    end

    def version
      @version ||= HTTParty.get("#{SERVICE_HOST}/version", :query => @query)["response"]
    end

    def list(path)
      escaped_path = Rack::Utils.escape(path)
      HTTParty.get("#{SERVICE_HOST}/#{version}/list/#{escaped_path}", :query => @query)
    end

    def show(path)
      escaped_path = Rack::Utils.escape(path)
      HTTParty.get("#{SERVICE_HOST}/#{version}/show/#{escaped_path}", :query => @query)["response"]
    end
  end
end
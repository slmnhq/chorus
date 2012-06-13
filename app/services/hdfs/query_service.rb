require 'timeout'
require 'httparty'

module Hdfs
  class QueryService
    SERVICE_HOST = YAML.load_file(Rails.root.join("config", "hdfs_service.yml"))["query_service_url"]
    TIMEOUT = 5.0 # second

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
      @version ||= query_version
      if @version.blank?
        raise ApiValidationError.new(:connection, :generic, {:message => 'Unable to determine HDFS server version. Check connection parameters.'})
      else
        @version
      end
    end

    def list(path)
      protect_remote_query do
        escaped_path = Rack::Utils.escape(path)
        HTTParty.get("#{SERVICE_HOST}/#{version}/list/#{escaped_path}", :query => @query)
      end
    end

    def show(path)
      protect_remote_query do
        escaped_path = Rack::Utils.escape(path)
        HTTParty.get("#{SERVICE_HOST}/#{version}/show/#{escaped_path}", :query => @query)
      end
    end

    private

    def query_version
      protect_remote_query do
        HTTParty.get("#{SERVICE_HOST}/version", :query => @query)["response"]
      end
    end

    def protect_remote_query(&block)
      Timeout::timeout(TIMEOUT, &block)
    rescue Errno::ECONNREFUSED
      raise ApiValidationError.new(:connection, :generic, {:message => "Impossible to connect to HDFS Query Service."})
    rescue Timeout::Error
      raise ApiValidationError.new(:connection, :generic, {:message => "Timeout while connecting to HDFS Query Service."})
    end
  end
end

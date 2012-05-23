require 'httparty'

module Hdfs
  class QueryService
    SERVICE_HOST = "http://localhost:5000"

    include HTTParty

    def initialize(instance)
      @instance = instance

      @query = {
          :host => @instance.host,
          :port => @instance.port,
          :username => @instance.username,
      }

      self.version
    end

    def version
      @version = self.class.get("#{SERVICE_HOST}/version", :query => @query)["response"]
    end

    def list(path)
      escaped_path = Rack::Utils.escape(path)
      self.class.get("#{SERVICE_HOST}/#{@version}/list/#{escaped_path}", :query => @query)
    end

    def show(path)
      escaped_path = Rack::Utils.escape(path)
      self.class.get("#{SERVICE_HOST}/#{@version}/show/#{escaped_path}", :query => @query)
    end

  end
end
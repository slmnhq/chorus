require 'timeout'

require Rails.root.join('vendor/hadoop/hdfs-query-service-0.0.1.jar')

module Hdfs
  DirectoryNotFoundError = Class.new(StandardError)
  FileNotFoundError = Class.new(StandardError)

  JavaHdfs = com.emc.greenplum.hadoop.Hdfs

  # NOTE: If we have 3 versions and 6 seconds timeout,
  #       we're going to wait 2 seconds for each one
  JavaHdfs.timeout = 5

  class QueryService
    def self.instance_version(instance)
      new(instance.host, instance.port, instance.username).version
    end

    def initialize(host, port, username, version = nil)
      @host = host
      @port = port.to_s
      @username = username
      @version = version
    end

    def version
      protect_remote_query do
        version = JavaHdfs.new(@host, @port, @username).server_version

        unless version
          raise ApiValidationError.new(:connection, :generic, {:message => 'Unable to determine HDFS server version. Check connection parameters.'})
        end
        version.get_name
      end
    end

    def list(path)
      protect_remote_query do
        list = JavaHdfs.new(@host, @port, @username, @version).list(path)
        raise DirectoryNotFoundError, "Directory does not exist: #{path}" unless list
        list.map do |object|
          {
              'path' => object.path,
              'modified_at' => object.modified_at,
              'is_directory' => object.is_directory,
              'size' =>  object.size,
              'content_count' => object.content_count
          }
        end
      end
    end

    def show(path)
      protect_remote_query do
        contents = JavaHdfs.new(@host, @port, @username, @version).content(path)
        raise FileNotFoundError, "File not found on HDFS: #{path}" unless contents
        contents
      end
    end

    private

    def protect_remote_query
      yield
    rescue Errno::ECONNREFUSED
      raise ApiValidationError.new(:connection, :generic, {:message => "Impossible to connect to HDFS Query Service."})
    rescue Timeout::Error
      raise ApiValidationError.new(:connection, :generic, {:message => "Timeout while connecting to HDFS Query Service."})
    end
  end
end

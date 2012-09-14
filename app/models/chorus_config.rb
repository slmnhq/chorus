require 'erb'
require 'yaml'
require 'active_support/core_ext/hash/deep_merge'

class ChorusConfig
  attr_accessor :config

  def initialize(root_dir=nil)
    set_root_dir(root_dir)
    app_config = YAML.load_file(config_file_path)
    defaults = YAML.load_file(File.join(@root_dir, 'config/chorus.defaults.yml'))

    @config = defaults.deep_merge(app_config)
  end

  def [](key_string)
    keys = key_string.split('.')
    keys.inject(@config) do |hash, key|
      hash.fetch(key)
    end
  rescue IndexError
    nil
  end

  def gpfdist_configured?
    (self['gpfdist.url'] && self['gpfdist.write_port'] && self['gpfdist.read_port'] &&
        self['gpfdist.data_dir'] && self['gpfdist.ssl'] != nil && true)
  end

  def self.config_file_path(root_dir=nil)
    root_dir = Rails.root unless root_dir
    File.join root_dir, 'config/chorus.yml'
  end

  def config_file_path
    self.class.config_file_path(@root_dir)
  end

  private

  def set_root_dir(root_dir)
    @root_dir = root_dir || Rails.root
  end
end
class ChorusConfig
  attr_accessor :config

  def initialize
    app_config = YAML.load_file(config_file_path)
    defaults = YAML.load_file(Rails.root + 'config/chorus.defaults.yml')

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
    self['gpfdist.url'] && self['gpfdist.port'] && self['gpfdist.data_dir'] && true
  end

  def self.config_file_path
    Rails.root + 'config/chorus.yml'
  end

  def config_file_path
    self.class.config_file_path
  end
end
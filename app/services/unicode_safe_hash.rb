class UnicodeSafeHash
  def self.load(yaml)
    return {} unless yaml.present?
    reader = org.yaml.snakeyaml.reader.UnicodeReader.new(org.jruby.util.IOInputStream.new(StringIO.new(yaml)))
    ruby_hash org.yaml.snakeyaml.Yaml.new.load(reader)
  end

  def self.dump(hash)
    return nil unless hash.present?
    org.yaml.snakeyaml.Yaml.new(dumper_options).dump(stringify_keys(hash))
  end

  private

  def self.stringify_keys(hash)
    hash.stringify_keys.inject({}) do |memo, key_value|
      key = key_value.first
      value = key_value.last
      memo[key] = value.is_a?(Hash) ? stringify_keys(value) : value
      memo
    end
  end

  def self.ruby_hash(java_hash)
    java_hash.inject({}) do |memo, key_value|
      key = key_value.first.to_sym
      value = key_value.last
      memo[key] = value.is_a?(Java::JavaUtil::LinkedHashMap) ? ruby_hash(value) : value
      memo
    end
  end

  def self.dumper_options
    opts = org.yaml.snakeyaml.DumperOptions.new
    opts.pretty_flow = true
    opts.explicit_start = true
    opts.explicit_end = true
    opts.default_flow_style = org.yaml.snakeyaml.DumperOptions::FlowStyle::BLOCK
    opts
  end
end
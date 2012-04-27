class PropertiesFile
  PARAM_REGEX = %r/\A([^=]+)=(.*)\z/

  def self.read(path)
    File.open(path, 'r') do |file|
      parse(file)
    end
  end

  def self.parse(properties_file)
    hash = {}
    while line = properties_file.gets
      match = PARAM_REGEX.match(line.chomp)
      hash[match[1].strip] = match[2].strip if match
    end
    hash
  end
end
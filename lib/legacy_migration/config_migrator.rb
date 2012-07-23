class ConfigMigrator

  attr_accessor :properties_path, :output_path, :example_path

  def initialize
    @output_path = LdapClient.config_file_path
  end

  def migrate
    # TODO - Figure out where this file is
    return if not @properties_path
    File.open(@output_path, 'w') { |f| f.write(config.to_yaml) }
  end

  def config
    config_from_example_file.merge(config_from_properties_file)
  end

  def config_from_properties_file
    properties_file_hash = PropertiesFile.read(@properties_path)
    {
      "ldap" => ldap_config(properties_file_hash)
    }
  end

  def config_from_example_file
    YAML.load_file(example_path)
  end

  def ldap_config(hash)
    {
      "host"              => hash["chorus.ldap.host"],
      "enable"            => hash["chorus.ldap.enable"] == "true",
      "port"              => hash["chorus.ldap.port"].to_i,
      "connect_timeout"   => hash["chorus.ldap.connect.timeout"].to_i,
      "bind_timeout"      => hash["chorus.ldap.bind.timeout"].to_i,
      "search"            => {
        "timeout"    => hash["chorus.ldap.search.timeout"].to_i,
        "size_limit" => hash["chorus.ldap.search.sizeLimit"].to_i
      },
      "base"              => hash["chorus.ldap.base"],
      "user_dn"           => hash["chorus.ldap.userDn"],
      "password"          => hash["chorus.ldap.password"],
      "dn_template"       => hash["chorus.ldap.dn.template"],
      "attribute"         => {
        "uid"   => hash["chorus.ldap.attribute.uid"],
        "ou"    => hash["chorus.ldap.attribute.ou"],
        "gn"    => hash["chorus.ldap.attribute.gn"],
        "sn"    => hash["chorus.ldap.attribute.sn"],
        "cn"    => hash["chorus.ldap.attribute.cn"],
        "mail"  => hash["chorus.ldap.attribute.mail"],
        "title" => hash["chorus.ldap.attribute.title"]
      }
    }
  end
end

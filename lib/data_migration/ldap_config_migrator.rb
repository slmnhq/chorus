class LdapConfigMigrator

  attr_accessor :properties_path, :yaml_path

  def initialize
    @yaml_path = LdapClient.config_file_path
  end

  def migrate
    # TODO - Figure out where this file is
    return if not @properties_path
    properties_file_hash = PropertiesFile.read(@properties_path)
    yaml = transform(properties_file_hash).to_yaml
    f = File.open(@yaml_path, 'w')
    f.write(yaml)
    f.close
  end

  def transform(hash)
    {
        "host" => hash["chorus.ldap.host"],
        "enable" => hash["chorus.ldap.enable"] == "true",
        "port" => hash["chorus.ldap.port"].to_i,
        "connect_timeout" => hash["chorus.ldap.connect.timeout"].to_i,
        "bind_timeout" => hash["chorus.ldap.bind.timeout"].to_i,
        "search_timeout" => hash["chorus.ldap.search.timeout"].to_i,
        "search_size_limit" => hash["chorus.ldap.search.sizeLimit"].to_i,
        "base" => hash["chorus.ldap.base"],
        "user_dn" => hash["chorus.ldap.userDn"],
        "password" => hash["chorus.ldap.password"],
        "dn_template" => hash["chorus.ldap.dn.template"],
        "attribute_uid" => hash["chorus.ldap.attribute.uid"],
        "attribute_ou" => hash["chorus.ldap.attribute.ou"],
        "attribute_gn" => hash["chorus.ldap.attribute.gn"],
        "attribute_sn" => hash["chorus.ldap.attribute.sn"],
        "attribute_cn" => hash["chorus.ldap.attribute.cn"],
        "attribute_mail" => hash["chorus.ldap.attribute.mail"],
        "attribute_title" => hash["chorus.ldap.attribute.title"],
    }
  end
end
require 'spec_helper'

describe LdapConfigMigrator, :type => :data_migration do
  before do
    @temp_yaml = Tempfile.open('ldap.yaml');
    LdapConfigMigrator.yaml_path = @temp_yaml.path

    @temp_props = Tempfile.open('chorus.properties')
    @temp_props.puts <<EOF
# Enable/disable LDAP
chorus.ldap.enable = false

## Ldap connection setting

# LDAP setting for testing AD server
chorus.ldap.host = 10.32.88.212
chorus.ldap.port = 389
chorus.ldap.connect.timeout = 10000
chorus.ldap.bind.timeout = 10000
chorus.ldap.search.timeout = 20000
chorus.ldap.search.sizeLimit = 200
chorus.ldap.base = DC=greenplum,DC=com
chorus.ldap.userDn = greenplum\\chorus
chorus.ldap.password = secret
chorus.ldap.dn.template = greenplum\\{0}
chorus.ldap.attribute.uid = sAMAccountName
chorus.ldap.attribute.ou = department
chorus.ldap.attribute.gn = givenName
chorus.ldap.attribute.sn = sn
chorus.ldap.attribute.cn = cn
chorus.ldap.attribute.mail = mail
chorus.ldap.attribute.title = title

foo.bar = sna
EOF
    @temp_props.flush
    LdapConfigMigrator.properties_path = @temp_props.path
    LdapConfigMigrator.migrate
  end

  it "should read and convert the ldap fields from chorus.properties" do
    yf = File.open LdapConfigMigrator.yaml_path
    ldap_config = YAML::load(yf)

    ldap_config["foo.bar"].should_not be_present

    ldap_config["enable"].should == false
    ldap_config["host"].should == "10.32.88.212"
    ldap_config["port"].should == 389
    ldap_config["connect_timeout"].should == 10000
    ldap_config["bind_timeout"].should == 10000
    ldap_config["search_timeout"].should == 20000
    ldap_config["search_size_limit"].should == 200
    ldap_config["base"].should == "DC=greenplum,DC=com"
    ldap_config["user_dn"].should == "greenplum\\chorus"
    ldap_config["password"].should == "secret"
    ldap_config["dn_template"].should == "greenplum\\{0}"
    ldap_config["attribute_uid"].should == "sAMAccountName"
    ldap_config["attribute_ou"].should == "department"
    ldap_config["attribute_gn"].should == "givenName"
    ldap_config["attribute_sn"].should == "sn"
    ldap_config["attribute_cn"].should == "cn"
    ldap_config["attribute_mail"].should == "mail"
    ldap_config["attribute_title"].should == "title"
  end
end
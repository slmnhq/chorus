require 'spec_helper'

PROPERTIES = <<EOF
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

EXAMPLE = <<EOF
some_key_not_present_in_properties_file: baz
EOF

describe ConfigMigrator, :type => :data_migration do
  before do
    example_file = Tempfile.open('chorus.yaml.example')
    properties_file = Tempfile.open('chorus.properties')
    example_file.puts EXAMPLE
    example_file.flush
    properties_file.puts PROPERTIES
    properties_file.flush

    @migrator = ConfigMigrator.new
    @migrator.output_path = output_file.path
    @migrator.example_path = example_file.path
    @migrator.properties_path = properties_file.path

    @migrator.migrate
  end

  let(:output_file) { Tempfile.open('chorus.yml') }
  let(:config) { YAML.load(output_file) }

  it "includes keys from the example yml file that aren't present in the properties file" do
    config["some_key_not_present_in_properties_file"].should == "baz"
  end

  describe "the LDAP section" do
    it "should contain all fields converted from chorus.properties" do
      ldap_config = config["ldap"]

      ldap_config["foo.bar"].should_not be_present

      ldap_config["enable"].should == false
      ldap_config["host"].should == "10.32.88.212"
      ldap_config["port"].should == 389
      ldap_config["connect_timeout"].should == 10000
      ldap_config["bind_timeout"].should == 10000
      ldap_config["base"].should == "DC=greenplum,DC=com"
      ldap_config["user_dn"].should == "greenplum\\chorus"
      ldap_config["password"].should == "secret"
      ldap_config["dn_template"].should == "greenplum\\{0}"

      ldap_config["attribute"].should == {
        "uid" => "sAMAccountName",
        "ou" => "department",
        "gn" => "givenName",
        "sn" => "sn",
        "cn" => "cn",
        "mail" => "mail",
        "title" => "title"
      }

      ldap_config["search"].should == {
        "timeout" => 20000,
        "size_limit" => 200
      }
    end
  end
end

require 'spec_helper'

LDAP_ENTRY1 = <<ENTRY
dn: uid=testguy,cn=users,dc=bartol
altsecurityidentities: Kerberos:untitled_1@BARTOL
apple-company: Example Corporation
apple-generateduid: 927107A3-92B4-4285-B153-A5C823369E24
apple-mcxflags:: PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiPz4KPCFET0NU
 WVBFIHBsaXN0IFBVQkxJQyAiLS8vQXBwbGUvL0RURCBQTElTVCAxLjAvL0VO
 IiAiaHR0cDovL3d3dy5hcHBsZS5jb20vRFREcy9Qcm9wZXJ0eUxpc3QtMS4w
 LmR0ZCI+CjxwbGlzdCB2ZXJzaW9uPSIxLjAiPgo8ZGljdD4KCTxrZXk+c2lt
 dWx0YW5lb3VzX2xvZ2luX2VuYWJsZWQ8L2tleT4KCTx0cnVlLz4KPC9kaWN0
 Pgo8L3BsaXN0Pgo=
authauthority: ;ApplePasswordServer;0xa1a21c2c8d9411e1940d045453061d87,1024 65537 114574792543369925664970476099531574810470011447394859817353327283009252641939234027203454336596092547412893300748255582830246395307601051059741455985758726565576050698713027643598211823458461426996675470307157668087994612395127920329176467950738294806584152682809589286911571551061068009380246772002575640033 root@bartol.sf.pivotallabs.com:10.80.2.53
authauthority: ;Kerberosv5;0xa1a21c2c8d9411e1940d045453061d87;testguy@BARTOL;BARTOL;1024 65537 114574792543369925664970476099531574810470011447394859817353327283009252641939234027203454336596092547412893300748255582830246395307601051059741455985758726565576050698713027643598211823458461426996675470307157668087994612395127920329176467950738294806584152682809589286911571551061068009380246772002575640033 root@bartol.sf.pivotallabs.com:10.80.2.53
cn: Test Guy
departmentnumber: Greenery
gidnumber: 20
givenname: Test
homedirectory: 99
loginshell: /bin/bash
mail: testguy@example.com
objectclass: person
objectclass: inetOrgPerson
objectclass: organizationalPerson
objectclass: posixAccount
objectclass: shadowAccount
objectclass: top
objectclass: extensibleObject
objectclass: apple-user
sn: Guy
title: Big Kahuna
uid: testguy
uidnumber: 1026
userpassword:: e0NSWVBUfSo=
ENTRY

LDAP_ENTRY2 = <<ENTRY
dn: uid=testguy2,cn=users,dc=bartol
altsecurityidentities: Kerberos:untitled_1@BARTOL
apple-company: Example Corporation
apple-generateduid: 927107A3-92B4-4285-B153-A5C823369E24
apple-mcxflags:: PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiPz4KPCFET0NU
 WVBFIHBsaXN0IFBVQkxJQyAiLS8vQXBwbGUvL0RURCBQTElTVCAxLjAvL0VO
 IiAiaHR0cDovL3d3dy5hcHBsZS5jb20vRFREcy9Qcm9wZXJ0eUxpc3QtMS4w
 LmR0ZCI+CjxwbGlzdCB2ZXJzaW9uPSIxLjAiPgo8ZGljdD4KCTxrZXk+c2lt
 dWx0YW5lb3VzX2xvZ2luX2VuYWJsZWQ8L2tleT4KCTx0cnVlLz4KPC9kaWN0
 Pgo8L3BsaXN0Pgo=
authauthority: ;ApplePasswordServer;0xa1a21c2c8d9411e1940d045453061d87,1024 65537 114574792543369925664970476099531574810470011447394859817353327283009252641939234027203454336596092547412893300748255582830246395307601051059741455985758726565576050698713027643598211823458461426996675470307157668087994612395127920329176467950738294806584152682809589286911571551061068009380246772002575640033 root@bartol.sf.pivotallabs.com:10.80.2.53
authauthority: ;Kerberosv5;0xa1a21c2c8d9411e1940d045453061d87;testguy@BARTOL;BARTOL;1024 65537 114574792543369925664970476099531574810470011447394859817353327283009252641939234027203454336596092547412893300748255582830246395307601051059741455985758726565576050698713027643598211823458461426996675470307157668087994612395127920329176467950738294806584152682809589286911571551061068009380246772002575640033 root@bartol.sf.pivotallabs.com:10.80.2.53
cn: Test Guy 2
departmentnumber: Greenery
gidnumber: 21
givenname: Test
homedirectory: 100
loginshell: /bin/bash
mail: testguy2@example.com
objectclass: person
objectclass: inetOrgPerson
objectclass: organizationalPerson
objectclass: posixAccount
objectclass: shadowAccount
objectclass: top
objectclass: extensibleObject
objectclass: apple-user
sn: Guy
title: Big Kahuna
uid: testguy
uidnumber: 1026
userpassword:: e0NSWVBUfSo=
ENTRY

LDAP_ENTRY3 = <<ENTRY
dn: uid=testguycustom,cn=users,dc=bartol
altsecurityidentities: Kerberos:untitled_1@BARTOL
apple-company: Example Corporation
apple-generateduid: 927107A3-92B4-4285-B153-A5C823369E24
apple-mcxflags:: PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiPz4KPCFET0NU
 WVBFIHBsaXN0IFBVQkxJQyAiLS8vQXBwbGUvL0RURCBQTElTVCAxLjAvL0VO
 IiAiaHR0cDovL3d3dy5hcHBsZS5jb20vRFREcy9Qcm9wZXJ0eUxpc3QtMS4w
 LmR0ZCI+CjxwbGlzdCB2ZXJzaW9uPSIxLjAiPgo8ZGljdD4KCTxrZXk+c2lt
 dWx0YW5lb3VzX2xvZ2luX2VuYWJsZWQ8L2tleT4KCTx0cnVlLz4KPC9kaWN0
 Pgo8L3BsaXN0Pgo=
authauthority: ;ApplePasswordServer;0xa1a21c2c8d9411e1940d045453061d87,1024 65537 114574792543369925664970476099531574810470011447394859817353327283009252641939234027203454336596092547412893300748255582830246395307601051059741455985758726565576050698713027643598211823458461426996675470307157668087994612395127920329176467950738294806584152682809589286911571551061068009380246772002575640033 root@bartol.sf.pivotallabs.com:10.80.2.53
authauthority: ;Kerberosv5;0xa1a21c2c8d9411e1940d045453061d87;testguy@BARTOL;BARTOL;1024 65537 114574792543369925664970476099531574810470011447394859817353327283009252641939234027203454336596092547412893300748255582830246395307601051059741455985758726565576050698713027643598211823458461426996675470307157668087994612395127920329176467950738294806584152682809589286911571551061068009380246772002575640033 root@bartol.sf.pivotallabs.com:10.80.2.53
cn: Test Guy 2
department: Greenery
gidnumber: 21
givenName: Test
homedirectory: 100
loginshell: /bin/bash
mail: testguy2@example.com
objectclass: person
objectclass: inetOrgPerson
objectclass: organizationalPerson
objectclass: posixAccount
objectclass: shadowAccount
objectclass: top
objectclass: extensibleObject
objectclass: apple-user
sn: Guy
title: Big Kahuna
uid: testguycustom
uidnumber: 1026
userpassword:: e0NSWVBUfSo=
ENTRY

CUSTOMIZED_LDAP_CHORUS_YML = <<YAML
session_timeout_minutes: 120
instance_poll_interval_minutes: 1
ldap:
  host: bartol.sf.pivotallabs.com
  enable: true 
  port: 389
  connect_timeout: 10000
  bind_timeout: 10000
  search:
    timeout: 20000
    size_limit: 200
  base: DC=bartol,DC=com
  user_dn: greenplum\\chorus
  password: secret
  dn_template: goofy\\{0}
  attribute:
    uid: uid 
    ou: department
    gn: givenName
    sn: sn
    cn: cn
    mail: mail
    title: title

YAML

DISABLED_LDAP_CHORUS_YML = <<YAML
session_timeout_minutes: 120
instance_poll_interval_minutes: 1
ldap:
  host: disabled.sf.pivotallabs.com
  enable: false 
  port: 389
  connect_timeout: 10000
  bind_timeout: 10000
  search:
    timeout: 20000
    size_limit: 200
  base: DC=bartol,DC=com
  user_dn: greenplum\\chorus
  password: secret
  dn_template: goofy\\{0}
  attribute:
    uid: uid 
    ou: department
    gn: givenName
    sn: sn
    cn: cn
    mail: mail
    title: title30573325

YAML

describe LdapClient do
  before :each do
    # RR doesn't like stubbing globals like this
    # Chorus::Application.config.chorus = YAML.load_file("#{Rails.root}/config/chorus.yml")[Rails.env]
  end

  after :each do
    RR.reset
  end

  let(:config_file_path) { "spec/fixtures/chorus.yml" }
  let(:entries) do
    [
        Net::LDAP::Entry.from_single_ldif_string(LDAP_ENTRY1),
        Net::LDAP::Entry.from_single_ldif_string(LDAP_ENTRY2)
    ]
  end

  describe ".search" do
    let(:entries) do
      [
          Net::LDAP::Entry.from_single_ldif_string(LDAP_ENTRY3)
      ]
    end

    it "maps the customized fields to our standardized fields" do
      stub(LdapClient).config { YAML.load(CUSTOMIZED_LDAP_CHORUS_YML)['ldap'] }
      any_instance_of(Net::LDAP) do |ldap|
        mock(ldap).search.with_any_args { entries }
      end

      results = LdapClient.search("testguycustom")
      results.should be_a(Array)
      results.first.should be_a(Hash)
      results.first.should == { :first_name => "Test", :last_name => "Guy", :title => "Big Kahuna", :dept => "Greenery", :email => "testguy2@example.com", :username => "testguycustom" }
    end
  end

  describe ".authenticate" do
    context "when the LDAP authentication succeeds" do
      before(:each) do
        any_instance_of(Net::LDAP) do |ldap|
          mock(ldap).bind { true }
        end
      end

      it "returns true" do
        LdapClient.authenticate("testguy", "secret").should be_true
      end
    end

    context "when the LDAP authentication fails" do
      before(:each) do
        any_instance_of(Net::LDAP) do |ldap|
          mock(ldap).bind { false }
        end
      end

      it "returns false" do
        LdapClient.authenticate("testguy", "secret").should be_false
      end
    end
  end

  describe "configuration" do
    it "reads configuration from a YAML file" do
      stub(LdapClient).config { YAML.load(CUSTOMIZED_LDAP_CHORUS_YML)['ldap'] }
      any_instance_of(Net::LDAP) do |ldap|
        mock(ldap).search.with_any_args do |options|
          options[:base].should == "DC=bartol,DC=com"
          options[:filter].to_s.should == "(uid=foo)"
          []
        end
        mock(ldap).auth("uid=foo,DC=bartol,DC=com", "secret") { true }
        mock(ldap).bind
      end

      LdapClient.search("foo")
      LdapClient.authenticate("foo", "secret")
    end
  end

  describe "enabled?" do
    context "when the ldap host is blank" do
      before do
        stub(LdapClient).config { YAML.load(DISABLED_LDAP_CHORUS_YML)['ldap'] }
      end

      it "returns false" do
        LdapClient.should_not be_enabled
      end
    end

    context "when the ldap host is present" do
      before do
        stub(LdapClient).config { YAML.load(CUSTOMIZED_LDAP_CHORUS_YML)['ldap'] }
      end

      it "returns true" do
        LdapClient.should be_enabled
      end
    end
  end
end
